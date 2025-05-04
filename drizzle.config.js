require("dotenv/config");

const { defineConfig } = require('drizzle-kit');

const url =
  process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : process.env.LOCAL_DATABASE_URL;
if (!url)
  throw new Error(
    `Connection string to ${process.env.NODE_ENV ? 'Neon' : 'local'} Postgres not found.`
  );

/** @type {import('drizzle-kit').Config} */
module.exports = defineConfig({
  out: './database/migrations',
  schema: './database/schema/*',
  dialect: 'postgresql',
  dbCredentials: { url },
});