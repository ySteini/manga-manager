import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);
    const collections = await prisma.collection.findMany();
    return json(collections);
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserId(request);
    const formData = await request.formData();
    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const file = formData.get("file") as File;
    const selectedCollections = formData.getAll("collections").map(id => Number(id));

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join("public/uploads", fileName);
    await writeFile(filePath, fileBuffer);

    await prisma.manga.create({
        data: {
            title,
            author,
            description,
            genre,
            file: fileName,
            collections: {
                connect: selectedCollections.map(id => ({ id }))
            }
        },
    });

    return redirect("/manga");
}

export default function NewManga() {
    const collections = useLoaderData<typeof loader>();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl mb-4">Neuen Manga hinzufügen</h1>
            <Form method="post" encType="multipart/form-data" className="space-y-4">
                <input name="title" placeholder="Titel" className="border p-2 w-full" required />
                <input name="author" placeholder="Autor" className="border p-2 w-full" required />
                <textarea name="description" placeholder="Beschreibung" className="border p-2 w-full" required />
                <input name="genre" placeholder="Genre (optional)" className="border p-2 w-full" />
                <input type="file" name="file" className="w-full" accept="application/pdf" required />

                <label className="block">Sammlungen:</label>
                <select name="collections" multiple className="border p-2 w-full h-32">
                    {collections.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <button type="submit" className="bg-green-600 text-white px-4 py-2">Speichern</button>
            </Form>
        </div>
    );
}
