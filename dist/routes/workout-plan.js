import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { ConflictError, ForbiddenError, NotFoundError, WorkoutPlanNotActiveError, } from "../lib/errors/index.js";
import { ErrorSchema, StartWorkoutSessionResponseSchema, UpdateWorkoutSessionBodySchema, UpdateWorkoutSessionParamsSchema, WorkoutDayDetailsSchema, WorkoutDayParamsSchema, WorkoutPlanDaySessionParamsSchema, WorkoutPlanParamsSchema, WorkoutPlanSchema, WorkoutPlanSummarySchema, WorkoutSessionSchema, } from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetWorkoutDayById } from "../usecases/GetWorkoutDayById.js";
import { GetWorkoutPlanById } from "../usecases/GetWorkoutPlanById.js";
import { StartWorkoutSession } from "../usecases/StartWorkoutSession.js";
import { UpdateWorkoutSession } from "../usecases/UpdateWorkoutSession.js";
export const workoutPlanRoutes = async (app) => {
    app.withTypeProvider().route({
        method: "GET",
        url: "/:workoutPlanId",
        schema: {
            tags: ["Workout Plans"],
            summary: "Get a workout plan by id",
            params: WorkoutPlanParamsSchema,
            response: {
                200: WorkoutPlanSummarySchema,
                401: ErrorSchema,
                403: ErrorSchema,
                404: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });
                if (!session) {
                    return reply.status(401).send({
                        error: "Unauthorized",
                        code: "UNAUTHORIZED",
                    });
                }
                const getWorkoutPlanById = new GetWorkoutPlanById();
                const result = await getWorkoutPlanById.execute({
                    userId: session.user.id,
                    workoutPlanId: request.params.workoutPlanId,
                });
                return reply.status(200).send(result);
            }
            catch (error) {
                app.log.error(error);
                if (error instanceof ForbiddenError) {
                    return reply.status(403).send({
                        error: error.message,
                        code: "FORBIDDEN",
                    });
                }
                if (error instanceof NotFoundError) {
                    return reply.status(404).send({
                        error: error.message,
                        code: "NOT_FOUND_ERROR",
                    });
                }
            }
        },
    });
    app.withTypeProvider().route({
        method: "GET",
        url: "/:workoutPlanId/days/:workoutDayId",
        schema: {
            tags: ["Workout Plans"],
            summary: "Get a workout day by id",
            params: WorkoutDayParamsSchema,
            response: {
                200: WorkoutDayDetailsSchema,
                401: ErrorSchema,
                403: ErrorSchema,
                404: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });
                if (!session) {
                    return reply.status(401).send({
                        error: "Unauthorized",
                        code: "UNAUTHORIZED",
                    });
                }
                const getWorkoutDayById = new GetWorkoutDayById();
                const result = await getWorkoutDayById.execute({
                    userId: session.user.id,
                    workoutPlanId: request.params.workoutPlanId,
                    workoutDayId: request.params.workoutDayId,
                });
                return reply.status(200).send(result);
            }
            catch (error) {
                app.log.error(error);
                if (error instanceof ForbiddenError) {
                    return reply.status(403).send({
                        error: error.message,
                        code: "FORBIDDEN",
                    });
                }
                if (error instanceof NotFoundError) {
                    return reply.status(404).send({
                        error: error.message,
                        code: "NOT_FOUND_ERROR",
                    });
                }
            }
        },
    });
    app.withTypeProvider().route({
        method: "POST",
        url: "/",
        schema: {
            tags: ["Workout Plans"],
            summary: "Create a workout plan",
            body: WorkoutPlanSchema.omit({ id: true }),
            response: {
                201: WorkoutPlanSchema,
                400: ErrorSchema,
                401: ErrorSchema,
                404: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });
                if (!session) {
                    return reply.status(401).send({
                        error: "Unauthorized",
                        code: "UNAUTHORIZED",
                    });
                }
                const createWorkoutPlan = new CreateWorkoutPlan();
                const result = await createWorkoutPlan.execute({
                    userId: session.user.id,
                    name: request.body.name,
                    workoutDays: request.body.workoutDays,
                });
                return reply.status(201).send(result);
            }
            catch (error) {
                app.log.error(error);
                if (error instanceof NotFoundError) {
                    return reply.status(404).send({
                        error: error.message,
                        code: "NOT_FOUND_ERROR",
                    });
                }
            }
        },
    });
    app.withTypeProvider().route({
        method: "POST",
        url: "/:workoutPlanId/days/:workoutDayId/sessions",
        schema: {
            tags: ["Workout Plans"],
            summary: "Start a workout session",
            params: WorkoutPlanDaySessionParamsSchema,
            response: {
                201: StartWorkoutSessionResponseSchema,
                401: ErrorSchema,
                403: ErrorSchema,
                404: ErrorSchema,
                409: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });
                if (!session) {
                    return reply.status(401).send({
                        error: "Unauthorized",
                        code: "UNAUTHORIZED",
                    });
                }
                const startWorkoutSession = new StartWorkoutSession();
                const result = await startWorkoutSession.execute({
                    userId: session.user.id,
                    workoutPlanId: request.params.workoutPlanId,
                    workoutDayId: request.params.workoutDayId,
                });
                return reply.status(201).send(result);
            }
            catch (error) {
                app.log.error(error);
                if (error instanceof ForbiddenError) {
                    return reply.status(403).send({
                        error: error.message,
                        code: "FORBIDDEN",
                    });
                }
                if (error instanceof WorkoutPlanNotActiveError) {
                    return reply.status(409).send({
                        error: error.message,
                        code: "WORKOUT_PLAN_NOT_ACTIVE",
                    });
                }
                if (error instanceof ConflictError) {
                    return reply.status(409).send({
                        error: error.message,
                        code: "WORKOUT_SESSION_ALREADY_STARTED",
                    });
                }
                if (error instanceof NotFoundError) {
                    return reply.status(404).send({
                        error: error.message,
                        code: "NOT_FOUND_ERROR",
                    });
                }
            }
        },
    });
    app.withTypeProvider().route({
        method: "PATCH",
        url: "/:workoutPlanId/days/:workoutDayId/sessions/:workoutSessionId",
        schema: {
            tags: ["Workout Plans"],
            summary: "Update a workout session",
            params: UpdateWorkoutSessionParamsSchema,
            body: UpdateWorkoutSessionBodySchema,
            response: {
                200: WorkoutSessionSchema,
                401: ErrorSchema,
                403: ErrorSchema,
                404: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(request.headers),
                });
                if (!session) {
                    return reply.status(401).send({
                        error: "Unauthorized",
                        code: "UNAUTHORIZED",
                    });
                }
                const updateWorkoutSession = new UpdateWorkoutSession();
                const result = await updateWorkoutSession.execute({
                    userId: session.user.id,
                    workoutPlanId: request.params.workoutPlanId,
                    workoutDayId: request.params.workoutDayId,
                    workoutSessionId: request.params.workoutSessionId,
                    completedAt: request.body.completedAt,
                });
                return reply.status(200).send(result);
            }
            catch (error) {
                app.log.error(error);
                if (error instanceof ForbiddenError) {
                    return reply.status(403).send({
                        error: error.message,
                        code: "FORBIDDEN",
                    });
                }
                if (error instanceof NotFoundError) {
                    return reply.status(404).send({
                        error: error.message,
                        code: "NOT_FOUND_ERROR",
                    });
                }
            }
        },
    });
};
