import "server-only";

import { assertDatabaseConfigured, pool, type DbClient } from "./index";

export async function withTransaction<T>(
  operation: (client: DbClient) => Promise<T>
): Promise<T> {
  assertDatabaseConfigured();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("Failed to roll back PostgreSQL transaction.", rollbackError);
    });
    throw error;
  } finally {
    client.release();
  }
}
