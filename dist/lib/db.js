import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../../src/lib/env.js";
import { PrismaClient } from "../generated/prisma/client.js";
const connectionString = `${env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
