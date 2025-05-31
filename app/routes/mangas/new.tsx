import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
    await requireUserId(request);
    const formData = await request.formData();
    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const file = formData.get("file") as File;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join("public/uploads", fileName);
    await writeFile(filePath, fileBuffer);

    await prisma.manga.create({
        data: { title, author, description, file: fileName },
    });

    return redirect("/mangas");
}

export default function NewManga() {
    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl mb-4">Neuen Manga hinzufügen</h1>
            <Form method="post" encType="multipart/form-data" className="space-y-4">
                <input name="title" placeholder="Titel" className="border p-2 w-full" required />
                <input name="author" placeholder="Autor" className="border p-2 w-full" required />
                <textarea name="description" placeholder="Beschreibung" className="border p-2 w-full" required />
                <input type="file" name="file" className="w-full" required />
                <button type="submit" className="bg-green-600 text-white px-4 py-2">Speichern</button>
            </Form>
        </div>
    );
}
