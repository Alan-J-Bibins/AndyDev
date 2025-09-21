import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
    return (
        <header className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-primary font-bold text-3xl">.niveD</h2>
            <Breadcrumbs />
            <div className="bg-primary rounded-full w-8 h-8" />
        </header>
    )
}

