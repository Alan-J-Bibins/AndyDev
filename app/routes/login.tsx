import { Form, redirect, useActionData, type ActionFunctionArgs } from "react-router"
import { serverSessionStorage } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const userEmail = String(formData.get('userEmail'));
    const userPassword = String(formData.get('userPassword'));

    let res;
    try {
        res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    email: userEmail,
                    password: userPassword
                }
            )
        })
    } catch (error) {
        console.log("AH SHIT in login.tsx", error);
        return { ok: false, error }
    }

    if (res) {
        if (!res.ok) {
            return { ok: false, error: "Cannot Login" }
        } else {
            const data = await res.json();
            console.log("ANDI MWONE")
            const session = await serverSessionStorage.getSession();
            session.set('userId', data.user.id);
            return redirect('/project', {
                headers: {
                    'Set-Cookie': await serverSessionStorage.commitSession(session),
                },
            });

        }
    } else {
        return { ok: false, error: "Login Could Not Be Completed" }
    }
}
export default function login() {
    const actionData = useActionData();
    return (
        <main className="h-screen flex justify-center items-center">
            <Form
                method="POST"
                action="/login"
                name="userLoginForm"
                className="flex flex-col p-4 justify-start items-start gap-4 w-1/3 bg-background/80 border border-primary/20"
            >
                <h3 className="text-accent tracking-widest"> LOGIN </h3>
                <label>Email:</label>
                <input
                    required
                    name="userEmail"
                    type="email"
                    placeholder="Enter Email"
                    className="w-full"
                />
                <label>Password:</label>
                <input
                    required
                    name="userPassword"
                    type="password"
                    placeholder="Enter Password"
                    className="w-full"
                />
                <div className="flex justify-start flex-row-reverse w-full">
                    <button type="submit" className="clickable">Submit</button>
                </div>
                {actionData?.error !== undefined && (
                    <span className="text-red-400">{(actionData?.error)}</span>
                )}
            </Form>
        </main>
    )
}

