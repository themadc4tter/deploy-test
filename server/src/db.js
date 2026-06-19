import pg from "pg";

const { Pool } = pg;

let pool;

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required.");
  }

  // Render and some other hosts may require SSL for PostgreSQL connections.
  // Keep this opt-in so local PostgreSQL can run without SSL.
  const shouldUseSsl = process.env.DATABASE_SSL === "true";

  return new Pool({
    connectionString,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false
        }
      : undefined
  });
}

export async function initializeDatabase() {
  pool = createPool();

  // Create the todos table if this is the first time this database is used.
  // PostgreSQL has real BOOLEAN and TIMESTAMPTZ types, unlike SQLite.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ
    );
  `);

  return pool;
}

export function getDatabase() {
  // This guard helps catch mistakes where route code tries to use the database
  // before initializeDatabase() has finished.
  if (!pool) {
    throw new Error("Database has not been initialized yet.");
  }

  return pool;
}
