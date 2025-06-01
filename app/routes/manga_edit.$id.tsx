import {
    LoaderFunctionArgs,
    ActionFunctionArgs,
    redirect,
    json,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserId(request);
    const id = Number(params.id);

    const [manga, allCollections] = await Promise.all([
        prisma.manga.findUnique({
            where: { id },
            include: { collections: { include: { collection: true } } },
        }),
        prisma.collection.findMany(),
    ]);

    if (!manga) throw new Response("Not Found", { status: 404 });

    // Extrahiere nur collection IDs aus der Verknüpfungstabelle
    const selectedIds = manga.collections.map(mc => mc.collection.id);

    return json({ manga, allCollections, selectedIds });
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserId(request);
    const id = Number(params.id);
    const form = await request.formData();

    const intent = form.get("intent");
    if (intent === "delete") {
        await prisma.mangaCollection.deleteMany({ where: { mangaId: id } });
        await prisma.manga.delete({ where: { id } });
        return redirect("/manga");
    }


    const title = form.get("title")?.toString() || "";
    const author = form.get("author")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const genre = form.get("genre")?.toString() || "";
    const collections = form.getAll("collections").map((id) => Number(id));

    await prisma.manga.update({
        where: { id },
        data: {
            title,
            author,
            description,
            genre,
            collections: {
                deleteMany: {},
                createMany: {
                    data: collections.map((collectionId) => ({ collectionId })),
                },
            },
        },
    });

    return redirect("/manga");
}

export default function EditManga() {
    const { manga, allCollections, selectedIds } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl mb-4">Manga bearbeiten</h1>

            <Form method="post" className="space-y-4">
                <input
                    name="title"
                    defaultValue={manga.title}
                    className="border p-2 w-full"
                    required
                />
                <input
                    name="author"
                    defaultValue={manga.author}
                    className="border p-2 w-full"
                    required
                />
                <textarea
                    name="description"
                    defaultValue={manga.description}
                    className="border p-2 w-full"
                    required
                />
                <input
                    name="genre"
                    defaultValue={manga.genre || ""}
                    className="border p-2 w-full"
                    placeholder="Genre (optional)"
                />

                <label className="block font-medium">Sammlungen:</label>
                <div className="flex flex-col gap-1">
                    {allCollections.map((c) => (
                        <label key={c.id} className="inline-flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="collections"
                                value={c.id}
                                defaultChecked={selectedIds.includes(c.id)}
                            />
                            {c.name}
                        </label>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-yellow-600 text-white px-4 py-2"
                    >
                        Aktualisieren
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-400 text-white px-4 py-2"
                    >
                        Zurück
                    </button>
                </div>
            </Form>

            <Form
                method="post"
                className="mt-6"
                onSubmit={(e) => {
                    if (
                        !confirm("Bist du sicher, dass du diesen Manga löschen willst?")
                    ) {
                        e.preventDefault();
                    }
                }}
            >
                <input type="hidden" name="intent" value="delete" />
                <button type="submit" className="bg-red-600 text-white px-4 py-2">
                    Löschen
                </button>
            </Form>
        </div>
    );
}
