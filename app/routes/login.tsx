import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { login } from "~/utils/auth.server";
import { createUserSession } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const username = form.get("username")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    const user = await login({ username, password });
    if (!user) {
        return json({ error: "Invalid credentials" }, { status: 400 });
    }
    return createUserSession(user.id, "/manga");
}

export default function LoginPage() {
    const data = useActionData<typeof action>();

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl mb-4">Login</h1>
            <Form method="post" className="space-y-4">
                {data?.error && <p className="text-red-500">{data.error}</p>}
                <input name="username" placeholder="Username" className="border p-2 w-full" />
                <input name="password" type="password" placeholder="Password" className="border p-2 w-full" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
            </Form>
        </div>
    );
}
