import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "~/server/db/schema";
import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const config = useRuntimeConfig();
const dbPath = config.databaseUrl || ".data/quicknotes.db";
const resolvedPath = resolve(dbPath);

const dir = dirname(resolvedPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(resolvedPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
