import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import z from "zod";

import { WeekDay } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { GetWorkoutPlans } from "../usecases/GetWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

export const aiRoutes = async (app: FastifyInstance) => {
  app.post("/ai", async function (request, reply) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    const { messages } = request.body as { messages: UIMessage[] };
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: "",
      tools: {
        getuserTrainData: tool({
          description: "Busca os dados de treino do usuário autenticado.",
          inputSchema: z.object({}),
          execute: async () => {
            const getUserTrainData = new GetUserTrainData();
            return getUserTrainData.execute({
              userId: session.user.id,
            });
          },
        }),
        updateUserTrainData: tool({
          description: "Cria ou atualiza os dados de treino do usuário autenticado.",
          inputSchema: z.object({
            weightInGrams: z.number(),
            heightInCentimeters: z.number(),
            age: z.number(),
            bodyFatPercentage: z.int().min(0),
          }),
          execute: async (input) => {
            const upsertUserTrainData = new UpsertUserTrainData();
            return upsertUserTrainData.execute({
              userId: session.user.id,
              weightInGrams: input.weightInGrams,
              heightInCentimeters: input.heightInCentimeters,
              age: input.age,
              bodyFatPercentage: input.bodyFatPercentage,
            });
          },
        }),
        getWorkoutPlans: tool({
          description: "Lista os planos de treino do usuário autenticado.",
          inputSchema: z.object({
            active: z.boolean().optional(),
          }),
          execute: async (input) => {
            const getWorkoutPlans = new GetWorkoutPlans();
            return getWorkoutPlans.execute({
              userId: session.user.id,
              active: input.active,
            });
          },
        }),
        createWorkoutPlan: tool({
          description: "Cria um novo plano de treino completo.",
          inputSchema: z.object({
            id: z.uuid(),
            name: z.string().describe("Nome do plano de treino"),
            workoutDays: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Nome do dia (ex: Peito e Tríceps, Descanso)"),
                  weekDay: z.enum(WeekDay).describe("Dia da semana"),
                  isRest: z
                    .boolean()
                    .default(false)
                    .describe("Se é dia de descanso(true) ou treino (false)"),
                  estimatedDurationInSeconds: z
                    .number()
                    .describe(
                      "Duração estimada em segundso (0 para das de descanso)",
                    ),
                  coverImageUrl: z
                    .url()
                    .optional()
                    .describe("URL daimagemd e capa do dia de treino."),
                  exercises: z
                    .array(
                      z.object({
                        order: z.number().describe("Ordem do exercício do dia"),
                        name: z.string().describe("Nome do exercício"),
                        sets: z.number().describe("Número de séries"),
                        reps: z.number().describe("Número de repetições"),
                        restTimeInSeconds: z
                          .number()
                          .describe(
                            "Tempo de descanso entre séries em segundos",
                          ),
                      }),
                    )
                    .describe(
                      "Lista de exercicios (vazia para dias de descanso)",
                    ),
                }),
              )
              .describe(
                "Array com exetamente 7 dias de treino (MONDAY to SUNDAY)",
              ),
          }),
          execute: async (input) => {
            const createWorkoutPlan = new CreateWorkoutPlan();
            const result = await createWorkoutPlan.execute({
              userId: session.user.id,
              name: input.name,
              workoutDays: input.workoutDays,
            });
            return result;
          },
        }),
      },
      stopWhen: stepCountIs(5),
      messages: await convertToModelMessages(messages),
    });
    const response = result.toUIMessageStreamResponse();
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body);
  });
};
