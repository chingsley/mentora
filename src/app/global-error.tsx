"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-text">
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-semibold text-header">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We hit an unexpected error. Please try again.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
          ) : null}
          <button
            onClick={reset}
            className="inline-flex h-10 w-fit items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
