import Link from "next/link";

export default function Navbar () {
    return (
        <header className="border-b border-zinc-200">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                <Link href="/" className="text-lg font-bold text-zinc-900">
                کاوین
                </Link>
                <Link href="spaces" className="hover:text-zinc-900">
                فضاها
                </Link>
                <Link href="about" className="hover:text-zinc-900">
                دربارۀ ما
                </Link>
                <Link href="contact" className="hover:text-zinc-900">
                تماس با ما
                </Link>
            </nav>
            </header>
    );
}