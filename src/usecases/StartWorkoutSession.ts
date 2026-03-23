import dayjs from "dayjs";

import { prisma } from "../lib/db.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  WorkoutPlanNotActiveError,
} from "../lib/errors/index.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  userWorkoutSessionId: string;
}

export class StartWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: dto.workoutPlanId,
      },
      select: {
        id: true,
        userId: true,
        isActive: true,
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found!");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new ForbiddenError("You are not allowed to access this workout plan.");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("Workout plan is not active.");
    }

    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
      },
      select: {
        id: true,
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found!");
    }

    const existingWorkoutSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: dto.workoutDayId,
        completedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (existingWorkoutSession) {
      throw new ConflictError("Workout session already started.");
    }

    const workoutSession = await prisma.workoutSession.create({
      data: {
        workoutDayId: dto.workoutDayId,
        startedAt: dayjs().toDate(),
      },
      select: {
        id: true,
      },
    });

    return {
      userWorkoutSessionId: workoutSession.id,
    };
  }
}
