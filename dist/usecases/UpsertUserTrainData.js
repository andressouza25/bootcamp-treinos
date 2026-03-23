import { prisma } from "../lib/db.js";
export class UpsertUserTrainData {
    async execute(dto) {
        if (!Number.isInteger(dto.bodyFatPercentage)) {
            throw new Error("Body fat percentage must be an integer.");
        }
        const userTrainData = await prisma.userTrainData.upsert({
            where: {
                userId: dto.userId,
            },
            update: {
                weightInGrams: dto.weightInGrams,
                heightInCentimeters: dto.heightInCentimeters,
                age: dto.age,
                bodyFatPercentage: dto.bodyFatPercentage,
            },
            create: {
                userId: dto.userId,
                weightInGrams: dto.weightInGrams,
                heightInCentimeters: dto.heightInCentimeters,
                age: dto.age,
                bodyFatPercentage: dto.bodyFatPercentage,
            },
            select: {
                userId: true,
                weightInGrams: true,
                heightInCentimeters: true,
                age: true,
                bodyFatPercentage: true,
            },
        });
        return {
            userId: userTrainData.userId,
            weightInGrams: userTrainData.weightInGrams,
            heightInCentimeters: userTrainData.heightInCentimeters,
            age: userTrainData.age,
            bodyFatPercentage: userTrainData.bodyFatPercentage,
        };
    }
}
