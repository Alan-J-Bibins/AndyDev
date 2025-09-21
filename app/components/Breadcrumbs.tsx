import { useLocation, useRouteLoaderData } from "react-router"

export default function Breadcrumbs() {
    let location = useLocation();

    const currentRoute = location.pathname;

    let routeSegments = currentRoute.split('/');

    routeSegments = routeSegments.filter(segment => segment !== "");

    if (routeSegments[0] === 'project') {
        const { project } = useRouteLoaderData("routes/_protected.project.$projectId");
        routeSegments[1] = project.name;
    }

    routeSegments[0] = routeSegments[0].charAt(0).toUpperCase() + routeSegments[0].slice(1);
    console.log("[/home/alan/AJB/Projects/devjams_2025/AndyDev/app/components/Breadcrumbs.tsx:7] routeSegments = ", routeSegments)

    return (
        <div className="flex justify-start w-fit items-center gap-2 text-accent text-2xl">
            {routeSegments.map((routeSegment, index) => {
                    return (
                    <>
                        <span> / </span>
                        <h2 key={index}>{routeSegment}</h2>
                    </>
                    );
                })
            }
        </div>
    )
}

