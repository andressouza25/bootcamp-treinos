import dayjs from "dayjs";
import { prisma } from "../lib/db.js";
import { ForbiddenError, NotFoundError } from "../lib/errors/index.js";
export class GetWorkoutDayById {
    async execute(dto) {
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
                name: true,
                isRest: true,
                coverImageUrl: true,
                estimatedDurationInSeconds: true,
                weekDay: true,
                exercises: {
                    select: {
                        id: true,
                        name: true,
                        order: true,
                        workoutDayId: true,
                        sets: true,
                        reps: true,
                        restTimeInSeconds: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
                sessions: {
                    select: {
                        id: true,
                        workoutDayId: true,
                        startedAt: true,
                        completedAt: true,
                    },
                    orderBy: {
                        startedAt: "desc",
                    },
                },
            },
        });
        if (!workoutDay) {
            throw new NotFoundError("Workout day not found!");
        }
        return {
            id: workoutDay.id,
            name: workoutDay.name,
            isRest: workoutDay.isRest,
            coverImageUrl: workoutDay.coverImageUrl ?? undefined,
            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
            weekDay: workoutDay.weekDay,
            exercises: workoutDay.exercises.map((exercise) => ({
                id: exercise.id,
                name: exercise.name,
                order: exercise.order,
                workoutDayId: exercise.workoutDayId,
                sets: exercise.sets,
                reps: exercise.reps,
                restTimeInSeconds: exercise.restTimeInSeconds,
            })),
            sessions: workoutDay.sessions.map((session) => ({
                id: session.id,
                workoutDayId: session.workoutDayId,
                startedAt: dayjs(session.startedAt).format("YYYY-MM-DD"),
                completedAt: session.completedAt
                    ? dayjs(session.completedAt).format("YYYY-MM-DD")
                    : undefined,
            })),
        };
    }
}
