# CampusConnect

CampusConnect is a Next.js student help and skills-sharing platform. This repository currently establishes the server-side PostgreSQL foundation using native SQL migrations, `pg`, Zod, and a transaction helper.

## Prerequisites

- Node.js 20+
- npm
- Docker with Docker Compose

No local PostgreSQL installation is required.

## Configuration

```bash
cp .env.example .env
```

`.env` is ignored by Git. Adjust the PostgreSQL password and keep `DATABASE_URL` consistent with it. `DATABASE_URL` is server-only and must not be prefixed with `NEXT_PUBLIC_`.

## Run the database and application

```bash
docker compose up -d
docker compose ps
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. The database health endpoint is `GET http://localhost:3000/api/health`.

Stop PostgreSQL without losing its persistent volume:

```bash
docker compose stop
```

Remove the container and network while retaining data:

```bash
docker compose down
```

## Database

PostgreSQL 16 runs as `campusconnect-db`, exposed on host port `5433`, with data in the `campusconnect-postgres-data` Docker volume. Migrations live in `database/migrations` and are applied once, in filename order, by `npm run db:migrate`. Each migration runs in its own transaction and applied versions are tracked in `schema_migrations`.

The schema contains `users`, `student_profiles`, `skills`, `student_profile_skills`, `help_requests`, `help_proposals`, `help_sessions`, `evaluations`, and `reports`. Foreign keys, status checks, uniqueness rules, and search indexes are defined in SQL.

Native SQL services are in `src/services`, database access is in `src/lib/db`, and Zod validators are in `src/validators`. Proposal acceptance uses a transaction and `FOR UPDATE` locking on the request, preventing concurrent acceptance of multiple proposals for one request.

## Authentication and profiles

Authentication uses Auth.js/NextAuth with the Credentials Provider and JWT sessions. `src/auth.ts` validates credentials with Zod, loads users through the existing `pg` services, compares bcrypt hashes, and places only the user ID, email, name, and role in the JWT/session. The database is not used as an Auth.js adapter.

Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET` (or `NEXTAUTH_SECRET`), and `NEXTAUTH_URL`. Public registration is `POST /api/register`; it always creates a `STUDENT` and inserts `users` plus `student_profiles` in one PostgreSQL transaction. Login/logout use Auth.js endpoints and `signIn`/`signOut`. `/api/profile` supports authenticated student `GET` and `PATCH` operations; ownership comes from the verified session, never from request data.

Server operations use `getCurrentUser`, `requireAuth`, `requireRole`, and `requireStudent` from `src/lib/auth/permissions.ts`. Middleware provides page redirects for `/profile`, `/dashboard`, `/login`, and `/register`, but every API operation also checks authentication and role server-side.

To test manually, start PostgreSQL, apply migrations, run `npm run dev`, register at `/register`, log in at `/login`, and update `/profile`. Automated checks are `npm run typecheck` and `npm run build`.

## Security notes

- All database queries use parameter placeholders; user input is never concatenated into SQL.
- Database modules import `server-only` and are not usable from browser components.
- Authorization remains a server-side responsibility. The example proposal acceptance service checks request ownership and locks the request row.
- Add session authentication and authorization middleware before exposing mutating routes.
- Do not commit `.env`, credentials, or database dumps.

## Checks

```bash
npm run typecheck
npm run build
```

Prisma, Drizzle, TypeORM, Sequelize, MikroORM, Firebase, SQLite, and SQL query builders are intentionally not used.
