import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = "super-secret"; // Nur für Demo

const storage = createCookieSessionStorage({
    cookie: {
        name: "RJ_session",
        secure: false,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
    },
});

export async function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request): Promise<number | null> {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    return userId ? Number(userId) : null;
}

export async function requireUserId(request: Request) {
    const userId = await getUserId(request);
    if (!userId) throw redirect("/login");
    return userId;
}

export async function createUserSession(userId: number, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: { "Set-Cookie": await storage.commitSession(session) },
    });
}

export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/login", {
        headers: { "Set-Cookie": await storage.destroySession(session) },
    });
}


import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUserFromSession(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { id: userId } });
}
