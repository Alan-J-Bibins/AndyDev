type Project = {
    id: number,
    name: string;
    path: string;
};

type ProjectListResponse = {
    requestId: string;
    ok: boolean;
    event: "Project List";
    output: Project[];
};

