import { Form, redirect, useActionData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router"
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');

    if (userId) {
        return redirect('/project');
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const userName = String(formData.get('userName'));
    const userEmail = String(formData.get('userEmail'));
    const userPassword = String(formData.get('userPassword'));
    const userOrg = String(formData.get('userOrg'));

    let res;
    try {
        res = await fetch(`${process.env.API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    name: userName,
                    email: userEmail,
                    password: userPassword,
                    org: userOrg
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
            console.log("ANDI MWONE")
            return redirect('/project')
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
                action="/register"
                name="userRegistrationForm"
                className="flex flex-col p-4 justify-start items-start gap-4 w-1/3 bg-background/80 border border-primary/20"
            >
                <h3 className="text-accent tracking-widest"> REGISTER </h3>
                <label>Name:</label>
                <input
                    required
                    name="userName"
                    type="text"
                    placeholder="Enter Name"
                    className="w-full"
                />
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
                <label>Organization:</label>
                <input
                    required
                    name="userOrg"
                    type="text"
                    placeholder="Enter Organization Name"
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

