import { Outlet, useLoaderData } from "react-router";
import Header from "~/components/Header";
import { WebSocketProvider } from "~/contexts/WebsocketContextProvider";

export const loader = async () => {
    // Check if user is authenticated
    return { user: { username: "Alan J Bibins", id: "1" } };
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

