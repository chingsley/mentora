"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl bg-foreground p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-semibold text-header">Authentication error</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
      >
        Try again
      </button>
    </div>
  );
}
