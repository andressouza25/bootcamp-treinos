import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  active?: boolean;
}

interface OutputDto {
  workoutPlans: Array<{
    id: string;
    name: string;
    workoutDays: Array<{
      id: string;
      name: string;
      weekDay: WeekDay;
      isRest: boolean;
      estimatedDurationInSeconds: number;
      coverImageUrl?: string;
      exercises: Array<{
        id: string;
        order: number;
        name: string;
        sets: number;
        reps: number;
        restTimeInSeconds: number;
      }>;
    }>;
  }>;
}

export class GetWorkoutPlans {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: {
        userId: dto.userId,
        ...(dto.active !== undefined ? { isActive: dto.active } : {}),
      },
      select: {
        id: true,
        name: true,
        workoutDays: {
          select: {
            id: true,
            name: true,
            weekDay: true,
            isRest: true,
            estimatedDurationInSeconds: true,
            coverImageUrl: true,
            exercises: {
              select: {
                id: true,
                order: true,
                name: true,
                sets: true,
                reps: true,
                restTimeInSeconds: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      workoutPlans: workoutPlans.map((workoutPlan) => ({
        id: workoutPlan.id,
        name: workoutPlan.name,
        workoutDays: workoutPlan.workoutDays.map((workoutDay) => ({
          id: workoutDay.id,
          name: workoutDay.name,
          weekDay: workoutDay.weekDay,
          isRest: workoutDay.isRest,
          estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
          coverImageUrl: workoutDay.coverImageUrl ?? undefined,
          exercises: workoutDay.exercises.map((exercise) => ({
            id: exercise.id,
            order: exercise.order,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restTimeInSeconds: exercise.restTimeInSeconds,
          })),
        })),
      })),
    };
  }
}
