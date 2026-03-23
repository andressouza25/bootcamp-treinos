import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { prisma } from "../lib/db.js";
dayjs.extend(utc);
export class GetStats {
    async execute(dto) {
        const fromDate = dayjs.utc(dto.from, "YYYY-MM-DD", true).startOf("day");
        const toDate = dayjs.utc(dto.to, "YYYY-MM-DD", true).endOf("day");
        const workoutSessions = await prisma.workoutSession.findMany({
            where: {
                workoutDay: {
                    workoutPlan: {
                        userId: dto.userId,
                    },
                },
                startedAt: {
                    gte: fromDate.toDate(),
                    lte: toDate.toDate(),
                },
            },
            select: {
                startedAt: true,
                completedAt: true,
            },
            orderBy: {
                startedAt: "asc",
            },
        });
        const consistencyByDay = {};
        let completedWorkoutsCount = 0;
        let totalTimeInSeconds = 0;
        workoutSessions.forEach((session) => {
            const sessionDate = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
            const currentDay = consistencyByDay[sessionDate] ?? {
                workoutDayCompleted: false,
                workoutDayStarted: false,
            };
            currentDay.workoutDayStarted = true;
            if (session.completedAt) {
                currentDay.workoutDayCompleted = true;
                completedWorkoutsCount += 1;
                totalTimeInSeconds += dayjs(session.completedAt).diff(session.startedAt, "second");
            }
            consistencyByDay[sessionDate] = currentDay;
        });
        const completedDates = Object.entries(consistencyByDay)
            .filter(([, value]) => value.workoutDayCompleted)
            .map(([date]) => date)
            .sort((leftDate, rightDate) => leftDate.localeCompare(rightDate));
        let workoutStreak = 0;
        let currentStreak = 0;
        let previousDate = null;
        completedDates.forEach((date) => {
            if (!previousDate) {
                currentStreak = 1;
                workoutStreak = 1;
                previousDate = date;
                return;
            }
            const differenceInDays = dayjs.utc(date).diff(dayjs.utc(previousDate), "day");
            if (differenceInDays === 1) {
                currentStreak += 1;
            }
            else {
                currentStreak = 1;
            }
            if (currentStreak > workoutStreak) {
                workoutStreak = currentStreak;
            }
            previousDate = date;
        });
        return {
            workoutStreak,
            consistencyByDay,
            completedWorkoutsCount,
            conclusionRate: workoutSessions.length > 0 ? completedWorkoutsCount / workoutSessions.length : 0,
            totalTimeInSeconds,
        };
    }
}
