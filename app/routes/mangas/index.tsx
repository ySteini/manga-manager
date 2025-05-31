import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserFromSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserFromSession(request);
    if (!user) throw new Response("Unauthorized", { status: 401 });

    const mangas = await prisma.manga.findMany({ orderBy: { createdAt: "desc" } });
    return json({ mangas, user });
}

export default function MangaIndex() {
    const { mangas, user } = useLoaderData<typeof loader>();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl">Willkommen, {user.username}!</h1>
                <Form method="post" action="/logout">
                    <button className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                </Form>
            </div>

            <Link to="/mangas/new" className="bg-blue-500 text-white px-4 py-2 mb-4 inline-block">Neuen Manga hinzufügen</Link>
            <ul className="space-y-2">
                {mangas.map(m => (
                    <li key={m.id} className="border p-4">
                        <h2 className="text-xl">{m.title}</h2>
                        <p>{m.author}</p>
                        <p>{m.description}</p>
                        <a href={`/uploads/${m.file}`} target="_blank" className="text-blue-600 underline">Datei öffnen</a><br />
                        <Link to={`/mangas/${m.id}/edit`} className="text-blue-500 underline">Bearbeiten</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
