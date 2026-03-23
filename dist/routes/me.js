import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { ErrorSchema, UserTrainDataWithUserSchema } from "../schemas/index.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
export const meRoutes = async (app) => {
    app.withTypeProvider().route({
        method: "GET",
        url: "/",
        schema: {
            tags: ["Me"],
            summary: "Get authenticated user train data",
            response: {
                200: UserTrainDataWithUserSchema.nullable(),
                401: ErrorSchema,
                500: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            if (!session) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    code: "UNAUTHORIZED",
                });
            }
            const getUserTrainData = new GetUserTrainData();
            const result = await getUserTrainData.execute({
                userId: session.user.id,
            });
            return reply.status(200).send(result);
        },
    });
};
