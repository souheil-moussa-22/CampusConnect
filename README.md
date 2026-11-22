# CampusConnect

CampusConnect is a Next.js App Router, TypeScript, Tailwind, Prisma/PostgreSQL student collaboration platform. It includes credentials authentication, role-aware dashboards, help requests and database search, proposals, study sessions, reviews, notifications, reporting/moderation, and transparent Smart Matching.

## Setup

1. Copy `.env.example` to `.env` and set a PostgreSQL `DATABASE_URL` and `AUTH_SECRET`.
2. Run `npm install`.
3. Run `npm run db:migrate` for local development, or `npx prisma migrate deploy` for an existing deployment, to apply the committed migration.
4. Run `npm run db:seed`.
5. Run `npm run dev` and open `http://localhost:3000`.

Demo accounts (password `Password123!`):
- `lena@campus.test` / `noah@campus.test` / `maya@campus.test` (student)
- `admin@campus.test` (administrator)

## Quality commands

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e` (starts the Next.js dev server when needed)
- `npm run build`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:seed`

## Architecture

The implementation follows a feature-based Clean Architecture layout under `src/modules`. Domain rules and matching logic are framework-independent. Application use cases depend on repository interfaces. Prisma repositories contain persistence and explicit transactions. Next.js pages, server actions, and routes are presentation/composition code.

The vertical slice implements the primary request-to-proposal-to-session journey, server-side ownership and admin checks, completed-session reviews, notifications, moderation, profile management, and search. A live PostgreSQL instance is required for database pages and seed execution; without one, the build remains buildable but database-backed runtime actions cannot execute.
