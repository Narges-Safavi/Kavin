import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600 sm:flex-row">
        <p>© 1405 کاوین. تمام حقوق محفوظ است.</p>
        <Link href="/contact" className="hover:text-zinc-900">
          تماس با ما
        </Link>
      </div>
    </footer>
  );
}