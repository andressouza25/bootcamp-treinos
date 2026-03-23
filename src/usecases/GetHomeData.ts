import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { NotFoundError } from "../lib/errors/index.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId: string;
  todayWorkoutDay: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
}

const weekDayByDateIndex: Record<number, WeekDay> = {
  0: WeekDay.SUNDAY,
  1: WeekDay.MONDAY,
  2: WeekDay.TUESDAY,
  3: WeekDay.WEDNESDAY,
  4: WeekDay.THURSDAY,
  5: WeekDay.FRIDAY,
  6: WeekDay.SATURDAY,
};

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const referenceDate = dayjs.utc(dto.date, "YYYY-MM-DD", true);
    const weekStart = referenceDate.startOf("week");
    const weekEnd = referenceDate.endOf("week");
    const targetWeekDay = weekDayByDateIndex[referenceDate.day()];

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
      select: {
        id: true,
        workoutDays: {
          select: {
            id: true,
            name: true,
            isRest: true,
            weekDay: true,
            estimatedDurationInSeconds: true,
            coverImageUrl: true,
            exercises: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!activeWorkoutPlan) {
      throw new NotFoundError("Active workout plan not found!");
    }

    const todayWorkoutDay = activeWorkoutPlan.workoutDays.find(
      (workoutDay) => workoutDay.weekDay === targetWeekDay,
    );

    if (!todayWorkoutDay) {
      throw new NotFoundError("Workout day not found for the provided date!");
    }

    const weekSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate(),
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const consistencyByDay: OutputDto["consistencyByDay"] = {};

    for (let index = 0; index < 7; index += 1) {
      const currentDate = weekStart.add(index, "day").format("YYYY-MM-DD");

      consistencyByDay[currentDate] = {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };
    }

    weekSessions.forEach((session) => {
      const sessionDate = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
      const currentConsistency =
        consistencyByDay[sessionDate] ?? {
          workoutDayCompleted: false,
          workoutDayStarted: false,
        };

      currentConsistency.workoutDayStarted = true;

      if (session.completedAt) {
        currentConsistency.workoutDayCompleted = true;
      }

      consistencyByDay[sessionDate] = currentConsistency;
    });

    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: activeWorkoutPlan.id,
        },
        completedAt: {
          not: null,
        },
        startedAt: {
          lte: referenceDate.endOf("day").toDate(),
        },
      },
      select: {
        workoutDayId: true,
        startedAt: true,
      },
    });

    const completedSessionDates = new Set(
      completedSessions.map((session) =>
        `${session.workoutDayId}:${dayjs.utc(session.startedAt).format("YYYY-MM-DD")}`,
      ),
    );

    const workoutDayByWeekDay = new Map(
      activeWorkoutPlan.workoutDays.map((workoutDay) => [workoutDay.weekDay, workoutDay]),
    );

    let workoutStreak = 0;
    let currentDate = referenceDate.startOf("day");

    while (true) {
      const currentWeekDay = weekDayByDateIndex[currentDate.day()];
      const currentWorkoutDay = workoutDayByWeekDay.get(currentWeekDay);

      if (!currentWorkoutDay) {
        break;
      }

      const workoutSessionKey = `${currentWorkoutDay.id}:${currentDate.format("YYYY-MM-DD")}`;

      if (!completedSessionDates.has(workoutSessionKey)) {
        break;
      }

      workoutStreak += 1;
      currentDate = currentDate.subtract(1, "day");
    }

    return {
      activeWorkoutPlanId: activeWorkoutPlan.id,
      todayWorkoutDay: {
        workoutPlanId: activeWorkoutPlan.id,
        id: todayWorkoutDay.id,
        name: todayWorkoutDay.name,
        isRest: todayWorkoutDay.isRest,
        weekDay: todayWorkoutDay.weekDay,
        estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
        coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todayWorkoutDay.exercises.length,
      },
      workoutStreak,
      consistencyByDay,
    };
  }
}
