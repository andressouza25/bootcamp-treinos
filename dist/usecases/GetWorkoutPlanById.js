import { prisma } from "../lib/db.js";
import { ForbiddenError, NotFoundError } from "../lib/errors/index.js";
export class GetWorkoutPlanById {
    async execute(dto) {
        const workoutPlan = await prisma.workoutPlan.findUnique({
            where: {
                id: dto.workoutPlanId,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                workoutDays: {
                    select: {
                        id: true,
                        weekDay: true,
                        name: true,
                        isRest: true,
                        coverImageUrl: true,
                        estimatedDurationInSeconds: true,
                        exercises: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });
        if (!workoutPlan) {
            throw new NotFoundError("Workout plan not found!");
        }
        if (workoutPlan.userId !== dto.userId) {
            throw new ForbiddenError("You are not allowed to access this workout plan.");
        }
        return {
            id: workoutPlan.id,
            name: workoutPlan.name,
            workoutDays: workoutPlan.workoutDays.map((workoutDay) => ({
                id: workoutDay.id,
                weekDay: workoutDay.weekDay,
                name: workoutDay.name,
                isRest: workoutDay.isRest,
                coverImageUrl: workoutDay.coverImageUrl ?? undefined,
                estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
                exercisesCount: workoutDay.exercises.length,
            })),
        };
    }
}
