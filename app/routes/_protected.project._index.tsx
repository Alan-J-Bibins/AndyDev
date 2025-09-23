import { useEffect, useState } from "react";
import { Form, href, NavLink, useNavigate } from "react-router";
import { useWebSocket } from "~/contexts/WebsocketContextProvider"
import { ChevronRight, EllipsisVertical, FolderGit2, Plus, Search } from 'lucide-react';
import CustomDialog from "~/components/Dialog";

export default function Page() {
    const { sendMessageWithResponse, messages, connected } = useWebSocket();
    console.log("[app/routes/_protected.project._index.tsx:8] messages = ", messages)
    const [projects, setProjects] = useState<Project[]>([]);
    useEffect(() => {
        if (connected) {
            sendMessageWithResponse({ event: "Project List", content: {} })
                .then((response) => {
                    console.log("Response from Project List:", response);
                    setProjects(response.output)
                })
                .catch((error) => {
                    console.error("WebSocket request failed:", error);
                });
        }
    }, [connected]);


    const navigate = useNavigate();
    const handleNewProjectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const projectName = formData.get("projectName")?.toString().trim();
        const initialPrompt = String(formData.get('initialPrompt'));

        if (projectName) {
            navigate(`/project/${projectName}`, { state: { initialPrompt } });
        }
    };

    return (
        <main className="h-full flex flex-col justify-start items-start gap-4 p-4">
            <div className="w-full flex justify-between items-center">
                <h1 className="text-4xl text-primary">Recent Projects</h1>
                <div className="flex justify-center items-center w-fit gap-4">
                    <CustomDialog
                        title="NEW PROJECT"
                        trigger={
                            <button className="clickable">
                                <Plus size={20} />
                                <span>
                                    New Project
                                </span>
                            </button>
                        }
                        submit={
                            <button className="clickable invisible">
                                Submit
                            </button>
                        }
                        cancel={
                            <button className="clickable invisible">
                                Cancel
                            </button>
                        }
                    >
                        <Form
                            method="POST"
                            name="newProjectForm"
                            onSubmit={handleNewProjectSubmit}
                            className="flex flex-col justify-center gap-4"
                        >
                            <label className="text-primary text-xl">Project Name</label>
                            <input
                                name="projectName"
                                type="text"
                                placeholder="Eg: zephyr"
                                required
                            />
                            <label className="text-primary text-xl">Initial Prompt</label>
                            <input
                                type="text"
                                name="initialPrompt"
                                placeholder="Start Typing..."
                                required
                            />
                            <div />

                            <div className="w-full flex-row-reverse flex">
                                <button type="submit" className="clickable w-fit">
                                    Submit
                                </button>
                            </div>
                        </Form>
                    </CustomDialog>
                    <button className="clickable">
                        <Search size={20} />
                        <span>
                            Search
                        </span>
                    </button>
                </div>
            </div>
            {projects.length === 0 && (
                <div className="w-full flex justify-center items-center text-primary/40 text-3xl">
                    Create a New Project to get started
                </div>
            )}
            <div className="grid grid-cols-5 grid-rows-5 gap-4 w-full h-full">
                {projects.map((project) => {
                    return (
                        <ProjectCard key={project.id} project={project} />
                    );
                })}
            </div>
        </main>
    )
}


export function ProjectCard({ project }: { project: Project }) {
    return (
        <NavLink
            to={href('/project/:projectId', { projectId: String(project.name) })}
            className="containerColors flex flex-col justify-start items-start p-4 w-full h-full gap-4 group"
        >
            <div className="flex justify-between items-center w-full">
                <FolderGit2 size={24} className="text-accent" />
                <EllipsisVertical size={24} className="group-hover:opacity-100 opacity-0 transition-opacity" />
            </div>
            <div className="flex justify-between items-center w-full">
                <h3 className="text-2xl truncate">
                    {project.name}
                </h3>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-all" />
            </div>
        </NavLink>
    );
}
