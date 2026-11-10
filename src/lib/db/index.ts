import "server-only";

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  campusConnectPool?: Pool;
};

export const pool =
  globalForDb.campusConnectPool ??
  new Pool({
    ...(databaseUrl ? { connectionString: databaseUrl } : {}),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.campusConnectPool = pool;
}

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error.", error);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
): Promise<QueryResult<T>> {
  assertDatabaseConfigured();
  return pool.query<T>(text, values);
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export type DbClient = PoolClient;

export function assertDatabaseConfigured(): void {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured for server-side database access.");
  }
}
