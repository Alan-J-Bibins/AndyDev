import { Form, redirect, type ActionFunctionArgs } from "react-router";
import { serverSessionStorage } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get('Cookie'));

    return redirect('/login', {
        headers: {
            'Set-Cookie': await serverSessionStorage.destroySession(session),
        },
    });

}

export default function Page() {
    return (
        <Form action="/profile" method="POST">
            <button type="submit" className="clickable">Sign Out</button>
        </Form>
    )
}

