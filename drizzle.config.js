require("dotenv/config");

const { defineConfig } = require("drizzle-kit");

const url = process.env.LOCAL_DATABASE_URL;
if (!url)
  throw new Error("LOCAL_DATABASE_URL not found in environment variables.");

/** @type {import('drizzle-kit').Config} */
module.exports = defineConfig({
  out: './database/migrations',
  schema: './database/schema/*',
  dialect: 'postgresql',
  dbCredentials: { url },
});
