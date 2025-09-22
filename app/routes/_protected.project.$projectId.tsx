import { RichTreeView } from "@mui/x-tree-view";
import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useWebSocket } from "~/contexts/WebsocketContextProvider";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const projectId = params.projectId;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const initialPrompt = searchParams.get("initialPrompt");
    console.log("[app/routes/_protected.project.$projectId.tsx:10] initialPrompt = ", initialPrompt)

    // dummy
    return {
        project: {
            name: projectId
        },
        initialPrompt
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const projectName = String(formData.get('projectName'));
    const initialPrompt = String(formData.get('initialPrompt'));

    return { ok: true, projectName, initialPrompt };
}


export default function Page() {
    const { project, initialPrompt } = useLoaderData<typeof loader>();
    const [projectName, setProjectName] = useState<string>("PROJECT NAME");
    const { messages, connected } = useWebSocket();
    console.log("Websocket connected?: ", connected);
    console.log("[app/routes/_protected.project.$projectId.tsx:35] messages = ", messages)

    const [fileTree, setFileTree] = useState({});

    let initialChatPrompt = "";
    useEffect(() => {

        if (project.name) {
            setProjectName(project.name)
        }

        if (initialPrompt)
            initialChatPrompt = initialPrompt;

        console.log("[app/routes/_protected.project.$projectId.tsx:49] initialPrompt = ", initialPrompt)

        // if (searchParams.toString() !== "") {
        //     setSearchParams({}, { replace: true });
        // }
    }, [])

    return (
        <main className="h-screen flex gap-4 p-4">
            <FileTree projectName={projectName} fileTree={fileTree} />
            <Terminal initialPrompt={initialChatPrompt} />
            <div className="flex flex-col gap-4 h-full w-full">
                <SubagentStatus />
                <ChatWithNived initialPrompt={initialChatPrompt} />
            </div>
        </main>
    );
}

export function FileTree({ projectName, fileTree }: { projectName: string, fileTree: any }) {

    const { sendMessageWithResponse, connected } = useWebSocket();

    useEffect(() => {
        if (connected) {
            console.log("WOOO")
            sendMessageWithResponse({
                event: "ProjectFileTreeRequest",
                content: {
                    projectName
                }
            }).then((response) => {
                console.log('ANDI LOOK HERE ', response)
            })
        }
    }, [connected])

    const ITEMS = [
        {
            id: 'root',
            label: 'Root Folder',
            children: [
                {
                    id: 'folder1',
                    label: 'Folder 1',
                    children: [
                        { id: 'file1', label: 'File 1.txt' }
                    ]
                },
                {
                    id: 'folder2',
                    label: 'Folder 2',
                    children: []
                }
            ]
        }
    ];


    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 overflow-hidden min-w-1/5">
            <h3 className="text-primary uppercase tracking-widest text-nowrap truncate">{projectName}</h3>
            <div className="font-code">
                <RichTreeView items={ITEMS} />
            </div>
        </div>
    );
}

export function CodeEditor() {
    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 w-full">
            <h3 className="text-primary uppercase tracking-widest">CODE EDITOR</h3>
        </div>
    );
}

export function Terminal({ initialPrompt }: { initialPrompt: string }) {
    const { sendMessageWithResponse, connected } = useWebSocket();
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        sendMessageWithResponse({ event: "Project Create", content: { task: initialPrompt, projectName: "Zephyr" } })
            .then((response) => {
                console.log("RESPONSE OBJ", response)
                setMessages(prev => [...prev, response.data])
            })
            .catch((error) => {
                console.error("WebSocket request failed:", error);
            });
    }, [connected])


    return (
        <div className="flex flex-col justify-start items-start gap-4 bg-secondary/20 border border-primary/20 p-4 w-full">
            <h3 className="text-primary uppercase tracking-widest">TERMINAL</h3>
            <div className="border border-primary/20 bg-secondary/20 p-4 w-full h-full font-code">
                {messages.map((message, index) => {
                    return (
                        <div key={index}>
                            {message}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function ChatWithNived({ initialPrompt }: { initialPrompt: string }) {

    const [msg, setMsg] = useState<string[]>([]);

    useEffect(() => {
        if (initialPrompt !== "") {
            setMsg(prev => [...prev, initialPrompt])
        }
    }, [])

    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 w-full h-full">
            <h3 className="text-primary uppercase tracking-widest text-nowrap">CHAT WITH NIVED</h3>
            {msg.map((singularMsg, index) => {
                return (
                    <div key={index}>
                        {singularMsg}
                    </div>
                );
            })}
        </div>
    );
}
export function SubagentStatus() {
    const { connected, sendMessageWithResponse } = useWebSocket();

    useEffect(() => {
        if (connected) {
            sendMessageWithResponse({
                event: "TestCase",
                content: {}
            }).then((response) => {
                console.log("ANOTHER ONEE ", response)
            })
        }
    }, [connected])
    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 w-full h-full">
            <h3 className="text-primary uppercase tracking-widest text-nowrap">SUBAGENT STATUS</h3>
        </div>
    );
}
