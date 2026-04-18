export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl bg-foreground ring-1 ring-black/5" />
        <div className="h-32 animate-pulse rounded-xl bg-foreground ring-1 ring-black/5" />
      </div>
    </div>
  );
}
