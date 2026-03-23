import { prisma } from "../lib/db.js";
export class GetUserTrainData {
    async execute(dto) {
        const user = await prisma.user.findUnique({
            where: {
                id: dto.userId,
            },
            select: {
                id: true,
                name: true,
                trainData: {
                    select: {
                        weightInGrams: true,
                        heightInCentimeters: true,
                        age: true,
                        bodyFatPercentage: true,
                    },
                },
            },
        });
        if (!user || !user.trainData) {
            return null;
        }
        return {
            userId: user.id,
            userName: user.name,
            weightInGrams: user.trainData.weightInGrams,
            heightInCentimeters: user.trainData.heightInCentimeters,
            age: user.trainData.age,
            bodyFatPercentage: user.trainData.bodyFatPercentage,
        };
    }
}
