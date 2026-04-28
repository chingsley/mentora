# Mentora

A modular tutoring platform that connects students with great teachers, schedules their sessions, runs a virtual classroom, and hosts their learning materials — with guardians getting a read-only view of student progress.

This repo contains the **MVP slice** of Mentora: auth, roles, profiles, guardian linking, teacher availability, teacher search, and enrollment with capacity control. Video, LMS, and payments are stubbed behind provider interfaces and will be wired up in later phases.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Language | TypeScript strict |
| DB | PostgreSQL via Prisma 6 |
| Auth | Auth.js v5 (credentials, JWT sessions, HTTP-only cookies) |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Testing | Jest + ts-jest |
| Package manager | pnpm |

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ running locally (or any reachable Postgres URL)

## Getting started

```bash
pnpm install
cp .env.example .env
# set DATABASE_URL, AUTH_SECRET, and any region/admin seed values

pnpm db:push     # apply the Prisma schema to your database
pnpm db:seed     # seed admin + demo teacher + regions + subjects
pnpm dev         # Next.js dev server (default http://localhost:3000)
```

The dev and production servers listen on **`PORT`** (default **3000**). Next.js reads **`PORT`** for `pnpm dev` and `pnpm start`.

**Public site URL (one rule for every consumer—client, Auth.js, emails):** if **`NEXT_PUBLIC_APP_URL`** is set, that is the canonical origin. If it is omitted, the canonical origin is **`http://localhost:${PORT}`**. `next.config.ts` writes that value into both **`NEXT_PUBLIC_APP_URL`** and **`AUTH_URL`**, so you configure at most one URL. In production, set **`NEXT_PUBLIC_APP_URL`** to your real HTTPS origin; **`PORT`** is then only the process listen port (often set by the host) and does not need to match the public URL.

Demo accounts created by the seed:

| Email | Password | Role |
| --- | --- | --- |
| `admin@mentora.local` | `ChangeMe123!` | ADMIN |
| `teacher@mentora.local` | `ChangeMe123!` | TEACHER |

Register a student via `/register?role=STUDENT` to explore the full student → teacher → enrollment flow.

## Scripts

```bash
PORT=4000 pnpm dev   # optional: dev server on port 4000 (default 3000)
pnpm dev          # Next.js dev server
pnpm build        # Production build
pnpm start        # Run production build (respects PORT)
pnpm lint         # Lint with Next/ESLint
pnpm typecheck    # Strict TypeScript check
pnpm test         # Run Jest tests (capacity, pricing, ...)
pnpm db:generate  # Prisma client
pnpm db:push      # Push schema to DB (no migrations)
pnpm db:migrate   # Create & apply a migration in dev
pnpm db:seed      # Run prisma/seed.ts
pnpm db:studio    # Prisma Studio UI
```

## Project layout

```
src/
  app/                 Next.js App Router (pages, layouts, server actions, route handlers)
  components/
    ui/                Reusable primitives (Button, Input, Card, Select, Dialog)
    features/          Feature components (TeacherCard, ...)
    layouts/           Shell pieces (AppShell, SignOutButton)
  server/              server-only data access layer (Prisma queries)
  lib/                 Cross-cutting utilities (auth, db, env, time, capacity, pricing, providers)
  styles/globals.css   Tailwind + theme CSS variables
prisma/
  schema.prisma        Postgres schema (User, Role, TeacherProfile, ..., Enrollment, PlatformPolicy)
  seed.ts              Demo seed
.cursor/rules/mentora.mdc   Project-wide engineering rules
```

## Capacity rule

The capacity for any class period is `min(admin global cap, teacher's personal cap)`. This is enforced in `src/lib/capacity.ts` and again at the DB write boundary in `src/server/enrollments.ts`. When a period reaches the effective cap, students see it as **full** on the teacher profile and the checkbox is disabled; dropping an active enrollment re-opens a seat automatically.

## Pricing rule

Teachers set their hourly rate per subject + region. Admins set a per-region floor. `src/lib/pricing.ts` enforces the floor (`assertAtLeastMinRate`) and computes totals per period duration. **UI** uses normal **major** amounts (dollars, euros, naira); `src/lib/money.ts` converts to/from smallest units. The database still stores **integers in the smallest currency unit** for precision.

## Provider interfaces (stubbed)

Deferred integrations live behind TypeScript interfaces and can be swapped for real SDKs later without touching call sites:

- `src/lib/providers/video.ts` — `VideoProvider` (default: `NoopVideoProvider`). Swap for Agora/Daily/Twilio.
- `src/lib/providers/payment.ts` — `PaymentProvider` (default: `NoopPaymentProvider`). Swap for Stripe or Paystack.
- `src/lib/providers/storage.ts` — `StorageProvider` (default: in-memory `LocalStorageProvider`). Swap for AWS S3.

## Cursor rule

`.cursor/rules/mentora.mdc` is a project-wide rule (always applied) that encodes the architecture, naming, componentization, data-fetching, security, styling, and testing conventions. Keep it in sync with new decisions.

## Out of scope (MVP)

- Virtual classroom video
- LMS file uploads, assignments, grading
- Payments / Stripe webhooks
- Real email delivery (guardian invite links are logged to the server console in dev)
- Auto-attendance tracking (ships with video integration)

## License

Proprietary — internal project.
