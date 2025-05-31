
import { LoaderFunctionArgs, ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ params, request }: LoaderFunctionArgs) {
    await requireUserId(request);
    const id = Number(params.id);
    const manga = await prisma.manga.findUnique({ where: { id } });
    if (!manga) throw new Response("Not Found", { status: 404 });
    return json(manga);
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserId(request);
    const id = Number(params.id);
    const form = await request.formData();
    const title = form.get("title")?.toString() || "";
    const author = form.get("author")?.toString() || "";
    const description = form.get("description")?.toString() || "";

    await prisma.manga.update({
        where: { id },
        data: { title, author, description },
    });

    return redirect("/mangas");
}

export default function EditManga() {
    const manga = useLoaderData<typeof loader>();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl mb-4">Manga bearbeiten</h1>
            <Form method="post" className="space-y-4">
                <input name="title" defaultValue={manga.title} className="border p-2 w-full" required />
                <input name="author" defaultValue={manga.author} className="border p-2 w-full" required />
                <textarea name="description" defaultValue={manga.description} className="border p-2 w-full" required />
                <button type="submit" className="bg-yellow-600 text-white px-4 py-2">Aktualisieren</button>
            </Form>
        </div>
    );
}
