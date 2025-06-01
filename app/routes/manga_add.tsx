import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, Link } from "@remix-run/react";
import { writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { requireUserId, getUserFromSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const collections = await prisma.collection.findMany();
    return json({ collections, user });
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

    const newManga = await prisma.manga.create({
        data: {
            title,
            author,
            description,
            genre,
            file: fileName,
        },
    });

    if (selectedCollections.length > 0) {
        await prisma.mangaCollection.createMany({
            data: selectedCollections.map((collectionId) => ({
                mangaId: newManga.id,
                collectionId,
            })),
        });
    }

    return redirect("/manga");
}

export default function NewManga() {
    const { collections, user } = useLoaderData<typeof loader>();

    return (
        <div className="flex min-h-screen text-white bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 p-6 flex flex-col space-y-4 h-screen sticky top-0">
                <h1 className="text-2xl font-bold mb-2">Manga Manager</h1>

                <Link
                    to="/manga_add"
                    className="bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                >
                    ➕ Manga hinzufügen
                </Link>

                <nav className="flex flex-col space-y-2 mt-4">
                    <Link to="/manga" className="block hover:text-blue-400">📚 Übersicht</Link>
                    <Link to="/collections" className="block hover:text-blue-400">🗃️ Collections</Link>
                </nav>

                <Form method="post" action="/logout" className="absolute bottom-6 left-6">
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Logout</button>
                </Form>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-2xl mb-6">Neuen Manga hinzufügen</h2>
                <Form method="post" encType="multipart/form-data" className="space-y-4 max-w-xl">
                    <input name="title" placeholder="Titel" className="border p-2 w-full" required />
                    <input name="author" placeholder="Autor" className="border p-2 w-full" required />
                    <textarea name="description" placeholder="Beschreibung" className="border p-2 w-full" required />
                    <input name="genre" placeholder="Genre (optional)" className="border p-2 w-full" />
                    <input type="file" name="file" className="w-full" accept="application/pdf" required />

                    <fieldset>
                        <legend className="block mb-1 font-semibold">Sammlungen:</legend>
                        <div className="grid grid-cols-2 gap-2">
                            {collections.map((c) => (
                                <label key={c.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="collections"
                                        value={c.id}
                                        className="accent-blue-500"
                                    />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <button type="submit" className="bg-green-600 text-white px-4 py-2">Speichern</button>
                </Form>
            </main>
        </div>
    );
}
