import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Header from "~/components/Header";
import { WebSocketProvider } from "~/contexts/WebsocketContextProvider";
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {

    const session = await serverSessionStorage.getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    console.log("[app/routes/_protected.tsx:8] userId = ", userId)

    if (!userId) {
        return redirect('/login', {
            headers: {
                'Set-Cookie': await serverSessionStorage.destroySession(session),
            },
        });
    }

    return { user: { username: "Alan J Bibins", id: userId } };
}


export default function Layout() {
    const { user } = useLoaderData<typeof loader>();
    return (
        <WebSocketProvider userId={user.id}>
            <Header />
            <Outlet />
        </WebSocketProvider>
    )
}

