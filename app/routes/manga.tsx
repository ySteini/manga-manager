import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserFromSession } from "~/utils/session.server";
import PdfPreview from "~/components/PdfPreview";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const manga = await prisma.manga.findMany({ orderBy: { createdAt: "desc" } });
    return json({ manga, user });
}

export default function MangaIndex() {
    const { manga, user } = useLoaderData<typeof loader>();

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manga.map(m => (
                        <div key={m.id} className="bg-gray-800 rounded p-4 shadow-md">
                            <div className="mb-4">
                                <PdfPreview url={`/uploads/${m.file}`} />
                            </div>
                            <h3 className="text-xl font-semibold">{m.title}</h3>
                            <p className="text-sm text-gray-300">{m.author}</p>
                            <p className="text-sm mt-1">{m.description}</p>
                            <div className="mt-3 flex justify-between items-center">
                                <a
                                    href={`/uploads/${m.file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    Datei öffnen
                                </a>
                                <Link
                                    to={`/manga_edit/${m.id}`}
                                    className="text-sm text-yellow-400 hover:underline"
                                >
                                    Bearbeiten
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
