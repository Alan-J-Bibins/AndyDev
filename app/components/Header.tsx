import { href, NavLink } from "react-router";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
    return (
        <header className="px-8 py-4 flex justify-between items-center">
            <div className="flex justify-start items-center gap-2">
                <NavLink
                    to={href('/')}
                    className="text-primary font-bold text-3xl">
                    .niveD
                </NavLink>
                <Breadcrumbs />
            </div>
            <NavLink to={href('/profile')}>
                <div className="bg-primary rounded-full w-8 h-8" />
            </NavLink>
        </header>
    )
}

