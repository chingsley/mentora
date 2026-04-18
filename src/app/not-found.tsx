import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-header">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 w-fit items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
      >
        Go home
      </Link>
    </main>
  );
}
