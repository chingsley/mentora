import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { acceptInviteAction } from "./actions";

export const metadata: Metadata = { title: "Accept guardian invite" };

interface Props {
  searchParams: Promise<{ token?: string; email?: string; error?: string; ok?: string }>;
}

export default async function AcceptGuardianInvitePage({ searchParams }: Props) {
  const { token, email, error, ok } = await searchParams;
  const session = await auth();

  if (!token || !email) {
    return <InvalidInvite />;
  }

  if (ok) {
    return (
      <Wrapper>
        <Card>
          <CardHeader>
            <CardTitle>Invite accepted</CardTitle>
            <CardDescription>
              You now have read-only access to your student&apos;s Mentora records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
            >
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  if (!session?.user) {
    const registerHref = `/register?role=GUARDIAN&inviteEmail=${encodeURIComponent(email)}`;
    const loginHref = `/login`;
    return (
      <Wrapper>
        <Card>
          <CardHeader>
            <CardTitle>You&apos;ve been invited as a guardian</CardTitle>
            <CardDescription>
              Sign in (or create a guardian account with <strong>{email}</strong>) to accept. We&apos;ll
              bring you right back here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link
                href={registerHref}
                className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
              >
                Create guardian account
              </Link>
              <Link
                href={loginHref}
                className="inline-flex h-10 items-center rounded-md border border-header/20 bg-foreground px-4 text-sm font-medium text-header hover:border-header/40"
              >
                I already have an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  if (session.user.role !== "GUARDIAN") {
    return (
      <Wrapper>
        <Card>
          <CardHeader>
            <CardTitle>Wrong account type</CardTitle>
            <CardDescription>
              Guardian invites can only be accepted by guardian accounts. You&apos;re signed in as
              a {session.user.role.toLowerCase()}.
            </CardDescription>
          </CardHeader>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <CardTitle>Accept guardian invite</CardTitle>
          <CardDescription>
            You&apos;re about to link your account ({session.user.email}) to a student who invited{" "}
            <strong>{email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
          <form action={acceptInviteAction}>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
            >
              Accept invite
            </button>
          </form>
        </CardContent>
      </Card>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <header className="mb-6 flex items-center">
        <Link href="/" className="text-lg font-semibold text-header">
          Mentora
        </Link>
      </header>
      {children}
    </div>
  );
}

function InvalidInvite() {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <CardTitle>Invalid invite</CardTitle>
          <CardDescription>This invite link is missing a token or email.</CardDescription>
        </CardHeader>
      </Card>
    </Wrapper>
  );
}
