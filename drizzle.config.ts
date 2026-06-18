import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/server/db/schema/*",
  out: "./app/server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || ".data/quicknotes.db",
  },
});
