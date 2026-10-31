import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import {PrismaClient} from "~/prisma/generated/prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");

    const adapter = new PrismaPg({
        connectionString: url,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    });
    return new PrismaClient({ adapter });
}

export const db = g.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") g.prisma = db;