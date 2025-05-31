import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function register({ username, password }: { username: string; password: string }) {
    const hash = await bcrypt.hash(password, 10);
    return await prisma.user.create({
        data: { username, password: hash },
    });
}

export async function login({ username, password }: { username: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}
