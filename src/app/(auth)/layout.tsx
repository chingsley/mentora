import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-header text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="text-xl font-semibold">
            Mentora
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-2/5 max-w-none flex-1 items-center px-4 py-10 sm:px-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
