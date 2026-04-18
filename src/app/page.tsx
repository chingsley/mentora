import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="bg-header text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Mentora
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-md px-3 py-2 hover:bg-white/10">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-white px-3 py-2 font-medium text-header hover:bg-white/90"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-header sm:text-5xl">
              Learn any subject, from great teachers, on your schedule.
            </h1>
            <p className="mt-5 max-w-prose text-base text-text/80 sm:text-lg">
              Mentora connects students with vetted tutors. Search by subject,
              pick a time that works for you, and join your virtual classroom in
              one click. Guardians get a read-only dashboard of progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register?role=STUDENT"
                className="inline-flex items-center justify-center rounded-md bg-header px-5 py-3 text-sm font-medium text-white hover:bg-header/90"
              >
                I&apos;m a student
              </Link>
              <Link
                href="/register?role=TEACHER"
                className="inline-flex items-center justify-center rounded-md border border-header/20 bg-foreground px-5 py-3 text-sm font-medium text-header hover:border-header/40"
              >
                I&apos;m a teacher
              </Link>
              <Link
                href="/register?role=GUARDIAN"
                className="inline-flex items-center justify-center rounded-md border border-header/20 bg-foreground px-5 py-3 text-sm font-medium text-header hover:border-header/40"
              >
                I&apos;m a guardian
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-foreground p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <h2 className="text-lg font-semibold text-header">
              What you get with Mentora
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-text/80">
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-header" />
                Smart search &amp; recommendations based on your interests.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-header" />
                Flexible scheduling with automatic capacity control.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-header" />
                Virtual classrooms, assignments, and grades in one place.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-header" />
                Guardian accounts with read-only progress visibility.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-text/60 sm:px-6">
        &copy; {new Date().getFullYear()} Mentora. All rights reserved.
      </footer>
    </main>
  );
}
