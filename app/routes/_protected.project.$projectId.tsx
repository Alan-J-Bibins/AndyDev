import { useLoaderData, type LoaderFunctionArgs } from "react-router";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const projectId = params.projectId;

    // dummy
    return {
        project: {
            id: projectId,
            name: "Project One"
        }
    }
}


export default function Page() {
    const { project } = useLoaderData<typeof loader>();

    return (
        <main className="h-screen flex gap-4 p-1">
            <FileTree projectName={project.name} />
            <CodeEditor />
        </main>
    );
}

export function FileTree({ projectName }: { projectName: string }) {
    return (
        <div className="bg-secondary/20 border border-primary/20 p-4">
            <h3 className="text-primary uppercase tracking-widest text-nowrap">{projectName}</h3>
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
