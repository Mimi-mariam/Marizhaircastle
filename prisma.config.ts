import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Load the environment file matching the active environment so Prisma CLI
// commands (migrate/seed) see the same values as the app.
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
config({ path: resolve(envFile) });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/marizhaircastle?schema=public",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
