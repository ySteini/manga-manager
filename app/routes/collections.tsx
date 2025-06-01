import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserFromSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const collections = await prisma.collection.findMany({
        include: {
            mangas: {
                include: {
                    manga: true,
                },
            },
        },
    });

    return json({ collections, user });
}

export async function action({ request }: ActionFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const form = await request.formData();
    const name = form.get("name")?.toString() || "";
    const intent = form.get("intent");

    if (intent === "create" && name) {
        await prisma.collection.create({ data: { name } });
    } else if (intent === "delete") {
        const id = Number(form.get("id"));
        await prisma.collection.delete({ where: { id } });
    }

    return redirect("/collections");
}

export default function CollectionsPage() {
    const { collections, user } = useLoaderData<typeof loader>();

    return (
        <div className="flex min-h-screen text-white bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 p-6 space-y-6">
                <h1 className="text-2xl font-bold">Manga Manager</h1>
                <nav className="space-y-2">
                    <Link to="/manga" className="block hover:text-blue-400">📚 Übersicht</Link>
                    <Link to="/manga_add" className="block hover:text-blue-400">➕ Hinzufügen</Link>
                    <Link to="/collections" className="block hover:text-blue-400">🗃️ Collections</Link>
                </nav>
                <Form method="post" action="/logout" className="absolute bottom-6 left-6">
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Logout</button>
                </Form>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Willkommen, {user.username}!</h2>
                </div>

                <Form method="post" className="mb-6 flex gap-2">
                    <input
                        name="name"
                        placeholder="Neue Collection"
                        className="border p-2 w-full bg-gray-700 text-white"
                        required
                    />
                    <button
                        type="submit"
                        name="intent"
                        value="create"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Erstellen
                    </button>
                </Form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                        <div key={collection.id} className="bg-gray-800 rounded p-4 shadow-md">
                            <h3 className="text-xl font-semibold">{collection.name}</h3>
                            <p className="text-sm text-gray-300 mb-2">
                                {collection.mangas.length} Manga(s)
                            </p>
                            <ul className="list-disc list-inside text-sm mb-4">
                                {collection.mangas.map((mc) => (
                                    <li key={mc.mangaId}>{mc.manga.title}</li>
                                ))}
                            </ul>
                            <Form method="post">
                                <input type="hidden" name="id" value={collection.id} />
                                <button
                                    type="submit"
                                    name="intent"
                                    value="delete"
                                    className="text-red-500 text-sm underline"
                                    onClick={(e) => {
                                        if (!confirm("Diese Collection wirklich löschen?")) e.preventDefault();
                                    }}
                                >
                                    Löschen
                                </button>
                            </Form>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
