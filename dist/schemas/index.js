import z from "zod";
import { WeekDay } from "../generated/prisma/enums.js";
export const ErrorSchema = z.object({
    error: z.string(),
    code: z.string(),
});
export const WorkoutPlanSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    workoutDays: z.array(z.object({
        name: z.string().trim().min(1),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean().default(false),
        estimatedDurationInSeconds: z.number().min(1),
        coverImageUrl: z.url().optional(),
        exercises: z.array(z.object({
            order: z.number().min(0),
            name: z.string().trim().min(1),
            sets: z.number().min(1),
            reps: z.number().min(1),
            restTimeInSeconds: z.number().min(1),
        })),
    })),
});
export const WorkoutPlansQuerySchema = z.object({
    active: z.stringbool().optional(),
});
export const WorkoutPlanListExerciseSchema = z.object({
    id: z.uuid(),
    order: z.number().min(0),
    name: z.string().trim().min(1),
    sets: z.number().min(1),
    reps: z.number().min(1),
    restTimeInSeconds: z.number().min(1),
});
export const WorkoutPlanListDaySchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    weekDay: z.enum(WeekDay),
    isRest: z.boolean(),
    estimatedDurationInSeconds: z.number().min(1),
    coverImageUrl: z.url().optional(),
    exercises: z.array(WorkoutPlanListExerciseSchema),
});
export const WorkoutPlansResponseSchema = z.object({
    workoutPlans: z.array(z.object({
        id: z.uuid(),
        name: z.string().trim().min(1),
        workoutDays: z.array(WorkoutPlanListDaySchema),
    })),
});
export const WorkoutPlanDaySessionParamsSchema = z.object({
    workoutPlanId: z.uuid(),
    workoutDayId: z.uuid(),
});
export const StartWorkoutSessionResponseSchema = z.object({
    userWorkoutSessionId: z.uuid(),
});
export const UpdateWorkoutSessionParamsSchema = z.object({
    workoutPlanId: z.uuid(),
    workoutDayId: z.uuid(),
    workoutSessionId: z.uuid(),
});
export const UpdateWorkoutSessionBodySchema = z.object({
    completedAt: z.iso.datetime(),
});
export const WorkoutSessionSchema = z.object({
    id: z.uuid(),
    completedAt: z.iso.datetime(),
    startedAt: z.iso.datetime(),
});
export const HomeParamsSchema = z.object({
    date: z.iso.date(),
});
export const HomeConsistencySchema = z.object({
    workoutDayCompleted: z.boolean(),
    workoutDayStarted: z.boolean(),
});
export const HomeTodayWorkoutDaySchema = z.object({
    workoutPlanId: z.uuid(),
    id: z.uuid(),
    name: z.string().trim().min(1),
    isRest: z.boolean(),
    weekDay: z.enum(WeekDay),
    estimatedDurationInSeconds: z.number().min(1),
    coverImageUrl: z.url().optional(),
    exercisesCount: z.number().min(0),
});
export const HomeResponseSchema = z.object({
    activeWorkoutPlanId: z.uuid(),
    todayWorkoutDay: HomeTodayWorkoutDaySchema,
    workoutStreak: z.number().min(0),
    consistencyByDay: z.record(z.iso.date(), HomeConsistencySchema),
});
export const WorkoutPlanParamsSchema = z.object({
    workoutPlanId: z.uuid(),
});
export const WorkoutPlanDaySummarySchema = z.object({
    id: z.uuid(),
    weekDay: z.enum(WeekDay),
    name: z.string().trim().min(1),
    isRest: z.boolean(),
    coverImageUrl: z.url().optional(),
    estimatedDurationInSeconds: z.number().min(1),
    exercisesCount: z.number().min(0),
});
export const WorkoutPlanSummarySchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    workoutDays: z.array(WorkoutPlanDaySummarySchema),
});
export const WorkoutDayParamsSchema = z.object({
    workoutPlanId: z.uuid(),
    workoutDayId: z.uuid(),
});
export const WorkoutExerciseSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    order: z.number().min(0),
    workoutDayId: z.uuid(),
    sets: z.number().min(1),
    reps: z.number().min(1),
    restTimeInSeconds: z.number().min(1),
});
export const WorkoutDaySessionSummarySchema = z.object({
    id: z.uuid(),
    workoutDayId: z.uuid(),
    startedAt: z.iso.date(),
    completedAt: z.iso.date().optional(),
});
export const WorkoutDayDetailsSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    isRest: z.boolean(),
    coverImageUrl: z.url().optional(),
    estimatedDurationInSeconds: z.number().min(1),
    exercises: z.array(WorkoutExerciseSchema),
    weekDay: z.enum(WeekDay),
    sessions: z.array(WorkoutDaySessionSummarySchema),
});
export const StatsQuerySchema = z.object({
    from: z.iso.date(),
    to: z.iso.date(),
});
export const StatsResponseSchema = z.object({
    workoutStreak: z.number().min(0),
    consistencyByDay: z.record(z.iso.date(), HomeConsistencySchema),
    completedWorkoutsCount: z.number().min(0),
    conclusionRate: z.number().min(0),
    totalTimeInSeconds: z.number().min(0),
});
