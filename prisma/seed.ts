import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
    await db.user.create({
        data: { username: "admin", password: "$2a$10$hash", role: "admin" },
    });
}
seed();
