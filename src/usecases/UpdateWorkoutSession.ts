import dayjs from "dayjs";

import { prisma } from "../lib/db.js";
import { ForbiddenError, NotFoundError } from "../lib/errors/index.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  workoutSessionId: string;
  completedAt: string;
}

interface OutputDto {
  id: string;
  completedAt: string;
  startedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: dto.workoutPlanId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found!");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new ForbiddenError("You are not allowed to access this workout plan.");
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

    const workoutSession = await prisma.workoutSession.findFirst({
      where: {
        id: dto.workoutSessionId,
        workoutDayId: dto.workoutDayId,
      },
      select: {
        id: true,
        startedAt: true,
      },
    });

    if (!workoutSession) {
      throw new NotFoundError("Workout session not found!");
    }

    const updatedWorkoutSession = await prisma.workoutSession.update({
      where: {
        id: dto.workoutSessionId,
      },
      data: {
        completedAt: dayjs(dto.completedAt).toDate(),
      },
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return {
      id: updatedWorkoutSession.id,
      startedAt: updatedWorkoutSession.startedAt.toISOString(),
      completedAt: updatedWorkoutSession.completedAt?.toISOString() ?? dto.completedAt,
    };
  }
}
