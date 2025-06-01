import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link, Form, useSearchParams } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserFromSession } from "~/utils/session.server";
import PdfPreview from "~/components/PdfPreview";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const sortParam = url.searchParams.get("sort") || "createdAt_desc";

    const [field, order] = sortParam.split("_");
    const validFields = ["createdAt", "title", "author", "genre"];
    const validOrders = ["asc", "desc"];

    const orderBy =
        validFields.includes(field) && validOrders.includes(order)
            ? { [field]: order }
            : { createdAt: "desc" };

    const manga = await prisma.manga.findMany({
        orderBy,
        include: { collections: { include: { collection: true } } }, // load collections with name
    });

    return json({ manga, user, sortParam });
}

export default function MangaIndex() {
    const { manga, user, sortParam } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();

    function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
        searchParams.set("sort", e.target.value);
        setSearchParams(searchParams);
    }

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
                    <Link to="/manga" className="block hover:text-blue-400">
                        📚 Übersicht
                    </Link>
                    <Link to="/collections" className="block hover:text-blue-400">
                        🗃️ Collections
                    </Link>
                </nav>

                <Form method="post" action="/logout" className="absolute bottom-6 left-6">
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                        Logout
                    </button>
                </Form>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Willkommen, {user.username}!</h2>
                    <select
                        value={sortParam}
                        onChange={handleSortChange}
                        className="bg-gray-800 text-white p-2 rounded border border-gray-600"
                    >
                        <option value="createdAt_desc">Neueste zuerst</option>
                        <option value="createdAt_asc">Älteste zuerst</option>
                        <option value="title_asc">Titel A-Z</option>
                        <option value="title_desc">Titel Z-A</option>
                        <option value="author_asc">Autor A-Z</option>
                        <option value="author_desc">Autor Z-A</option>
                        <option value="genre_asc">Genre A-Z</option>
                        <option value="genre_desc">Genre Z-A</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manga.map((m) => (
                        <div key={m.id} className="bg-gray-800 rounded p-4 shadow-md flex">
                            <div className="mr-4">
                                <PdfPreview url={`/uploads/${m.file}`} />
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                                <div>
                                    <h3 className="text-xl font-semibold">{m.title}</h3>
                                    <p className="text-sm text-gray-300">{m.author}</p>
                                    <p className="text-sm mt-1">{m.description}</p>
                                </div>
                                <div className="mt-4 space-y-1">
                                    {m.genre && (
                                        <p className="text-xs bg-blue-700 inline-block px-2 py-0.5 rounded">
                                            Genre: {m.genre}
                                        </p>
                                    )}
                                    {m.collections.length > 0 && (
                                        <div className="bg-green-700 text-white text-xs rounded px-2 py-0.5 mt-1 max-w-max">
                                        <span className="font-semibold">Collections:</span>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                {m.collections.map((mc) => (
                                                    <li key={mc.collection.id}>{mc.collection.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

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
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
