import { useLocation } from "react-router"

export default function Breadcrumbs() {
    let location = useLocation();
    const currentRoute = location.pathname;

    const routeSegments = currentRoute.split('/');
    console.log("[/home/alan/AJB/Projects/devjams_2025/AndyDev/app/components/Breadcrumbs.tsx:7] routeSegments = ", routeSegments)
    return (
        <div>Breadcrumbs</div>
    )
}

