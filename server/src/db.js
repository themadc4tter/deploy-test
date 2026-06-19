import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Convert this file's URL into a normal file path.
// ES modules do not provide __dirname automatically, so we create it here.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep the database file inside the server folder.
// The file will be ignored by Git because it is local development data.
const dataDirectory = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDirectory, "todo-dashboard.sqlite");

let database;

export async function initializeDatabase() {
  // Make sure the data folder exists before SQLite tries to create the file.
  await fs.mkdir(dataDirectory, { recursive: true });

  // Open a connection to the SQLite database file.
  // If the file does not exist yet, SQLite creates it for us.
  database = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  // Create the todos table if this is the first time the app has run.
  // completed uses 0/1 because SQLite does not have a separate boolean type.
  await database.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );
  `);

  return database;
}

export function getDatabase() {
  // This guard helps catch mistakes where route code tries to use the database
  // before initializeDatabase() has finished.
  if (!database) {
    throw new Error("Database has not been initialized yet.");
  }

  return database;
}
