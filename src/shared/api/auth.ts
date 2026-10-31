import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        minPasswordLength: 8,
    },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "USER", input: false },
            status: { type: "string", defaultValue: "PENDING", input: false },
        },
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const user = await db.user.findUnique({
                        where: { id: session.userId },
                        select: { status: true },
                    });
                    if (user?.status !== "ACTIVE") {
                        throw new APIError("FORBIDDEN", {
                            message: "Аккаунт ожидает подтверждения администратором",
                        });
                    }
                },
            },
        },
    },
    plugins: [nextCookies()], // всегда последним
});