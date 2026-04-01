import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool, } from "ai";
import { fromNodeHeaders } from "better-auth/node";
import z from "zod";
import { WeekDay } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { GetWorkoutPlans } from "../usecases/GetWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";
const systemPrompt = `
Voce e um personal trainer virtual especialista em montar planos de treino para pessoas leigas em musculacao.

Regras gerais:
- Fale com tom amigavel, motivador e simples.
- Evite jargoes tecnicos.
- Respostas sempre curtas e objetivas.
- SEMPRE chame a tool getUserTrainData antes de qualquer interacao com o usuario.

Se getUserTrainData retornar null:
- Faça uma unica mensagem com perguntas simples e diretas pedindo: nome, peso em kg, altura em cm, idade e percentual de gordura corporal.
- Depois que o usuario responder, use a tool updateUserTrainData.
- Ao usar updateUserTrainData, converta o peso de kg para gramas.

Se getUserTrainData retornar dados:
- Cumprimente o usuario pelo nome.

Para criar um plano de treino:
- Pergunte de forma simples: objetivo, quantos dias por semana a pessoa pode treinar e se ha restricoes fisicas ou lesoes.
- Faça poucas perguntas.
- Se precisar de contexto, consulte getWorkoutPlans antes de sugerir um novo plano.
- O plano deve ter exatamente 7 dias: MONDAY ate SUNDAY.
- Dias sem treino devem usar isRest true, exercises vazio e estimatedDurationInSeconds 0.
- Sempre use a tool createWorkoutPlan para criar o plano.

Divisoes de treino:
- 2 a 3 dias por semana: Full Body ou ABC.
- 4 dias por semana: Upper/Lower de preferencia, ou ABCD.
- 5 dias por semana: PPLUL.
- 6 dias por semana: PPL 2x.

Principios de montagem:
- Agrupe musculos sinergicos.
- Coloque exercicios compostos antes dos isoladores.
- Use de 4 a 8 exercicios por sessao.
- Use 3 a 4 series por exercicio.
- Use 8 a 12 repeticoes para hipertrofia e 4 a 6 para forca.
- Descanso entre series: 60 a 90 segundos para hipertrofia e 2 a 3 minutos para compostos pesados.
- Evite repetir o mesmo grupo muscular em dias consecutivos.
- Use nomes descritivos para cada dia.

Cover images:
- Sempre defina coverImageUrl para todos os 7 dias.
- Dias majoritariamente superiores usam uma destas URLs, alternando entre elas:
  1. https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
  2. https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL
- Dias majoritariamente inferiores usam uma destas URLs, alternando entre elas:
  1. https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
  2. https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY
- Dias de descanso usam imagem de superior.
`;
export const aiRoutes = async (app) => {
    app.withTypeProvider().route({
        method: "POST",
        url: "/",
        schema: {
            tags: ["AI"],
            summary: "Chat with the virtual personal trainer",
            body: z.object({
                messages: z.array(z.custom()),
            }),
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
            const { messages } = request.body;
            const result = streamText({
                model: google("gemini-2.5-flash-lite"),
                system: systemPrompt,
                tools: {
                    getUserTrainData: tool({
                        description: "Busca os dados de treino do usuario autenticado.",
                        inputSchema: z.object({}),
                        execute: async () => {
                            const getUserTrainData = new GetUserTrainData();
                            return getUserTrainData.execute({
                                userId: session.user.id,
                            });
                        },
                    }),
                    updateUserTrainData: tool({
                        description: "Cria ou atualiza os dados de treino do usuario autenticado.",
                        inputSchema: z.object({
                            weightInGrams: z.number().int().min(1),
                            heightInCentimeters: z.number().int().min(1),
                            age: z.number().int().min(1),
                            bodyFatPercentage: z.int().min(0).max(100),
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
                        description: "Lista os planos de treino do usuario autenticado.",
                        inputSchema: z.object({}),
                        execute: async () => {
                            const getWorkoutPlans = new GetWorkoutPlans();
                            return getWorkoutPlans.execute({
                                userId: session.user.id,
                            });
                        },
                    }),
                    createWorkoutPlan: tool({
                        description: "Cria um novo plano de treino completo.",
                        inputSchema: z.object({
                            name: z.string().describe("Nome do plano de treino"),
                            workoutDays: z
                                .array(z.object({
                                name: z.string().describe("Nome do dia de treino"),
                                weekDay: z.enum(WeekDay).describe("Dia da semana"),
                                isRest: z
                                    .boolean()
                                    .default(false)
                                    .describe("Se o dia e descanso ou treino"),
                                estimatedDurationInSeconds: z
                                    .number()
                                    .describe("Duracao estimada em segundos"),
                                coverImageUrl: z
                                    .string()
                                    .url()
                                    .describe("URL da imagem de capa do dia"),
                                exercises: z.array(z.object({
                                    order: z.number().describe("Ordem do exercicio"),
                                    name: z.string().describe("Nome do exercicio"),
                                    sets: z.number().describe("Numero de series"),
                                    reps: z.number().describe("Numero de repeticoes"),
                                    restTimeInSeconds: z
                                        .number()
                                        .describe("Tempo de descanso entre series em segundos"),
                                })),
                            }))
                                .length(7)
                                .describe("Array com exatamente 7 dias de treino"),
                        }),
                        execute: async (input) => {
                            const createWorkoutPlan = new CreateWorkoutPlan();
                            return createWorkoutPlan.execute({
                                userId: session.user.id,
                                name: input.name,
                                workoutDays: input.workoutDays,
                            });
                        },
                    }),
                },
                stopWhen: stepCountIs(10),
                messages: await convertToModelMessages(messages),
            });
            const response = result.toUIMessageStreamResponse();
            reply.status(response.status);
            response.headers.forEach((value, key) => reply.header(key, value));
            return reply.send(response.body);
        },
    });
};
