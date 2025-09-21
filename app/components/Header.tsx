export default function Header() {
    return (
        <header className="px-8 py-4 flex justify-between items-center">
            <div className="flex justify-start items-center gap-1">
                <div className="bg-secondary rounded-full w-8 h-8" />
                <h2 className="text-primary font-bold text-3xl">.niveD</h2>
            </div>
            <div className="bg-primary rounded-full w-8 h-8" />
        </header>
    )
}

