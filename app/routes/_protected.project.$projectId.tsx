import rehypePrism from 'rehype-prism-plus';
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material/styles";
import { RichTreeView, TreeItem } from "@mui/x-tree-view";
import { useEffect, useState, type FormEvent } from "react";
import { Form, useLoaderData, useLocation, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { CodeEditorArea } from "~/components/CodeEditorArea";
import { useWebSocket } from "~/contexts/WebsocketContextProvider";
import { SquareTerminal } from 'lucide-react';

type TreeItem = {
    name: string,
    path: string,
    type: string,
    children?: TreeItem[]
}

interface TreeViewItem {
    id: string;
    label: string;
    children?: TreeViewItem[];
}


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

    return { ok: true, projectName };
}


export default function Page() {
    const { project } = useLoaderData<typeof loader>();
    const location = useLocation();
    const initialPrompt = location.state?.initialPrompt || "";
    const [projectName, setProjectName] = useState<string>(project.name);
    const { sendMessageWithResponse, messages, connected } = useWebSocket();
    const [fileTree, setFileTree] = useState<TreeItem>({ name: "Root", path: "/projects", children: [], type: "directory" });
    console.log("Websocket connected?: ", connected);
    console.log("[app/routes/_protected.project.$projectId.tsx:35] messages = ", messages)

    const [mainSection, setMainSection] = useState<"terminal" | "code">(initialPrompt === "" ? "code" : "terminal");

    useEffect(() => {
        if (project.name) {
            setProjectName(project.name)
        }

        console.log("[app/routes/_protected.project.$projectId.tsx:49] initialPrompt = ", initialPrompt)

        if (connected && projectName !== "PROJECT NAME") {
            console.log("WOOO")
            sendMessageWithResponse({
                event: "Project File Tree Request",
                content: {
                    projectName
                }
            }).then(response => {
                if (response && response.output && response.output.tree && response.output.tree.path) {
                    setFileTree(response.output.tree);
                } else {
                    console.warn("Invalid tree response:", response);
                }
            });
        }

    }, [])

    return (
        <main className="h-full flex gap-4">
            <FileTree projectName={projectName} fileTree={fileTree} />
            {mainSection === "terminal" && (
                <Terminal handleChangeSection={() => setMainSection("code")} initialPrompt={initialPrompt} projectName={projectName} />
            )}
            {mainSection === "code" && (
                <CodeEditor handleChangeSection={() => setMainSection("terminal")} />
            )}
            <div className="flex flex-col gap-4 h-full w-full">
                <SubagentStatus />
                <ChatWithNived projectName={projectName} initialPrompt={initialPrompt} />
            </div>
        </main>
    );
}

export function FileTree({ projectName, fileTree }: { projectName: string, fileTree: TreeItem }) {
    const theme = createTheme({
        components: {
            MuiTreeItem: {
                styleOverrides: {
                    label: {
                        fontFamily: 'Space Mono, monospace',
                        color: 'var(--color-text)'
                    },
                },
            },
        },
    });

    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 overflow-hidden min-w-1/5 overflow-y-auto">
            <h3 className="text-primary uppercase tracking-widest text-nowrap truncate">{projectName}</h3>
            <div className="font-code">
                <ThemeProvider theme={theme}>
                    {fileTree && fileTree.path ? (
                        <RichTreeView items={[fileTree]} getItemId={item => item.path} getItemLabel={item => item.name} />
                    ) : (
                        <div>Loading tree...</div>
                    )}
                </ThemeProvider>

            </div>
        </div>
    );
}

export function CodeEditor({ handleChangeSection }: { handleChangeSection: () => void }) {
    const [code, setCode] = useState<string>("");
    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 gap-4 w-full max-w-2xl">
            <div className='flex justify-between items-center w-full'>
                <h3 className="text-primary uppercase tracking-widest">CODE EDITOR</h3>
                <button
                    type='button'
                    onClick={handleChangeSection}
                    className='text-primary hover:text-accent transition-colors cursor-pointer'>
                    <SquareTerminal />
                </button>
            </div>
            <CodeEditorArea
                value={code}
                onChange={(evn) => setCode(evn.target.value)}
                padding={0}
                language="js"
                rehypePlugins={[
                    [rehypePrism, { ignoreMissing: true, showLineNumbers: true }]
                ]}
                style={{
                    backgroundColor: "transparent",
                    fontFamily: 'Space Mono,ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    fontSize: '16px',
                    height: '100%'
                }}

            />
        </div>
    );
}

export function Terminal({ initialPrompt, projectName, handleChangeSection }: { initialPrompt: string, projectName: string, handleChangeSection: () => void }) {
    const { sendMessageWithResponse, connected, messages } = useWebSocket();
    const [terminalMessages, setTerminalMessages] = useState<string[]>([]);
    const [currentRequestId, setCurrentRequestId] = useState<string>("");
    let projectCreatedFlag = false;

    useEffect(() => {
        if (currentRequestId) {
            const msgsFromReq = messages[currentRequestId] || [];
            const outputTexts = msgsFromReq.map(msg => msg.output?.text || '');
            setTerminalMessages(outputTexts);
        }
    }, [messages, currentRequestId]);


    useEffect(() => {
        if (!projectCreatedFlag) {
            sendMessageWithResponse({ event: "Project Create", content: { task: initialPrompt, projectName: projectName } })
                .then((response) => {
                    const reqId = response.requestId;
                    setCurrentRequestId(reqId);
                    const msgsFromReqId = messages[currentRequestId] || [];
                    const outputTexts = msgsFromReqId.map(msg => {
                        if (msg.output && typeof msg.output === 'object' && 'text' in msg.output) {
                            return msg.output.text;
                        }

                        return '';
                    })
                    setTerminalMessages(outputTexts);
                })
                .catch((error) => {
                    console.error("WebSocket request failed:", error);
                });
            projectCreatedFlag = true;
        }
    }, [connected])


    return (
        <div className="flex flex-col justify-start items-start gap-4 bg-secondary/20 border border-primary/20 p-4 w-full max-w-2xl">
            <div className='flex justify-between items-center w-full'>
                <h3 className="text-primary uppercase tracking-widest">TERMINAL</h3>
                <button
                    type='button'
                    onClick={handleChangeSection}
                    className='text-primary hover:text-accent transition-colors cursor-pointer'>
                    <SquareTerminal />
                </button>
            </div>
            <div className="border border-primary/20 bg-secondary/20 p-4 w-full h-full font-code overflow-y-auto">
                {terminalMessages.map((message, index) => {
                    return (
                        <div key={index}>
                            <pre>{message}</pre>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function ChatWithNived({ projectName, initialPrompt }: { projectName: string, initialPrompt: string }) {

    const [msg, setMsg] = useState<string[]>([]);

    useEffect(() => {
        if (initialPrompt !== "" && !msg.includes(initialPrompt)) {
            setMsg(prev => [...prev, initialPrompt]);
        }
    }, [initialPrompt]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }


    return (
        <div className="flex flex-col justify-between items-start gap-4 p-4 w-full h-full bg-secondary/20 border border-primary/20 ">
            <h3 className="text-primary uppercase tracking-widest text-nowrap">CHAT WITH NIVED</h3>
            <div className="flex flex-col justify-start items-start gap-4 w-full h-full">
                {msg.map((singularMsg, index) => {
                    return (
                        <div key={index} className="bg-accent/20 border border-primary/20 p-4 w-full">
                            {singularMsg}
                        </div>
                    );
                })}
            </div>
            <Form
                method="POST"
                action={`/project/${projectName}`}
                className="w-full"
            >
                <input
                    type="text"
                    required
                    className="w-full"
                    placeholder="Start Typing..."
                />
            </Form>
        </div>
    );
}
export function SubagentStatus() {
    return (
        <div className="bg-secondary/20 border border-primary/20 p-4 w-full h-full">
            <h3 className="text-primary uppercase tracking-widest text-nowrap">SUBAGENT STATUS</h3>
        </div>
    );
}
