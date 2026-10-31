import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@/shared/api/generated/prisma/client";

const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error("Задай ADMIN_EMAIL и ADMIN_PASSWORD");

    if (await db.user.findUnique({ where: { email } })) {
        return console.log("Админ уже существует");
    }

    const id = randomUUID();
    await db.user.create({
        data: {
            id,
            name: "Администратор",
            email,
            emailVerified: true,
            role: "ADMIN",
            status: "ACTIVE",
            accounts: {
                create: {
                    id: randomUUID(),
                    accountId: id,
                    providerId: "credential",
                    password: await hashPassword(password),
                },
            },
        },
    });
    console.log("Админ создан:", email);
}

main().finally(() => db.$disconnect());