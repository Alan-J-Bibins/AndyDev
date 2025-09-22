import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';

type WSContextType = {
    sendMessage: (msg: OutgoingMessage) => void;
    sendMessageWithResponse: (msg: Omit<OutgoingMessage, 'requestId'>) => Promise<IncomingMessage>;
    connected: boolean;
    lastMessage: IncomingMessage | null;
    messages: Record<string, IncomingMessage[]>;
};

const WebSocketContext = createContext<WSContextType | undefined>(undefined);

type IncomingMessage = {
    requestId: string;
    event: string;
    output: any;
};

type OutgoingMessage = {
    requestId: string;
    event: string;
    content: any;
};

type PendingRequestMap = {
    [requestId: string]: (value: IncomingMessage) => void;
};

export function WebSocketProvider({ userId, children }: { userId: string; children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<IncomingMessage | null>(null);
    const [messages, setMessages] = useState<Record<string, IncomingMessage[]>>({});
    const ws = useRef<WebSocket | null>(null);
    const pendingRequests = useRef<PendingRequestMap>({});

    useEffect(() => {
        if (!userId) return;

        ws.current = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/ws/user?userId=${userId}`);

        ws.current.onopen = () => setConnected(true);
        ws.current.onclose = () => setConnected(false);

        ws.current.onmessage = (event) => {
            const data: IncomingMessage = JSON.parse(event.data);

            if (data.requestId && pendingRequests.current[data.requestId]) {
                pendingRequests.current[data.requestId](data);
                delete pendingRequests.current[data.requestId];
            } else {
                setLastMessage(data);
            }

            if (data.requestId) {
                setMessages(prev => ({
                    ...prev,
                    [data.requestId]: [...(prev[data.requestId] || []), data],
                }));
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [userId]);

    const sendMessage = (msg: OutgoingMessage) => {
        if (connected && ws.current) {
            ws.current.send(JSON.stringify(msg));
        }
    };

    function createRequestId() {
        return Math.random().toString(36).slice(2) + Date.now();
    }

    const sendMessageWithResponse = (msg: Omit<OutgoingMessage, 'requestId'>): Promise<IncomingMessage> => {
        return new Promise((resolve, reject) => {
            const requestId = createRequestId();
            const messageWithId: OutgoingMessage = { ...msg, requestId };

            if (!connected || !ws.current) {
                reject(new Error('WebSocket not connected'));
                return;
            }

            pendingRequests.current[requestId] = resolve;
            sendMessage(messageWithId);

            // Optional: cleanup for unresolved promises after 10s
            setTimeout(() => {
                if (pendingRequests.current[requestId]) {
                    delete pendingRequests.current[requestId];
                    reject(new Error('WebSocket request timed out'));
                }
            }, 10000);
        });
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, sendMessageWithResponse, connected, lastMessage, messages }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

