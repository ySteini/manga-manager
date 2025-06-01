import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { register } from "~/utils/auth.server";
import { createUserSession } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const username = form.get("username")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    try {
        const user = await register({ username, password });
        return createUserSession(user.id, "/manga");
    } catch (err) {
        return json({ error: "User already exists" }, { status: 400 });
    }
}

export default function SignupPage() {
    const data = useActionData<typeof action>();

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl mb-4">Sign Up</h1>
            <Form method="post" className="space-y-4">
                {data?.error && <p className="text-red-500">{data.error}</p>}
                <input name="username" placeholder="Username" className="border p-2 w-full" />
                <input name="password" type="password" placeholder="Password" className="border p-2 w-full" />
                <button type="submit" className="bg-green-500 text-white px-4 py-2">Sign Up</button>
            </Form>
        </div>
    );
}
