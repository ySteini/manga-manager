import { Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    return { userId };
}

export default function IndexPage() {
    return (
        <main className="min-h-screen flex flex-col justify-center items-center text-center p-6">
            <h1 className="text-4xl font-bold mb-4">📚 Manga Manager</h1>
            <p className="mb-6 text-gray-600">Verwalte deine lokalen Mangas ganz einfach.</p>
            <div className="space-x-4">
                <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Login
                </Link>
                <Link to="/signup" className="bg-green-500 text-white px-4 py-2 rounded">
                    Registrieren
                </Link>
                <Link to="/mangas" className="bg-gray-700 text-white px-4 py-2 rounded">
                    Zur Manga-Verwaltung
                </Link>
            </div>
        </main>
    );
}
