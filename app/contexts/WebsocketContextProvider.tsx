import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';

type WSContextType = {
    sendMessage: (msg: OutgoingMessage) => void;
    connected: boolean;
    lastMessage: any | null;
};

const WebSocketContext = createContext<WSContextType | undefined>(undefined);

type OutgoingMessage = {
    event: string,
    content: any
}

export function WebSocketProvider({ userId, children }: { userId: string, children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!userId) return;

        console.log("Hello there obiwan kenobi");
        ws.current = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/ws/user/${userId}`);
        console.log(ws.current)

        ws.current.onopen = () => setConnected(true);
        ws.current.onclose = () => setConnected(false);

        ws.current.onmessage = (event) => {
            console.log(event.data)
            const data = JSON.parse(event.data);
            setLastMessage(data);
        };

        return () => {
            console.log("Closing websocket connection")
            ws.current?.close();
        };
    }, [userId]);

    const sendMessage = (msg: OutgoingMessage) => {
        if (connected && ws.current) {
            ws.current.send(JSON.stringify(msg));
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, connected, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};


