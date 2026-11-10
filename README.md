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

## Development account

There is no registration UI or authentication/session implementation yet. When the auth flow is added, it should validate registration input with `createUserSchema` and call `createUser`, which hashes passwords with bcrypt before inserting them. Never insert a plain-text password or expose `password_hash` in an API response.

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
