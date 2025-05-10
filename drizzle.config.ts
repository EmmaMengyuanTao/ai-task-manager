import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import * as path from 'path';

config({ path: path.resolve(__dirname, '.env.production') });

const url = process.env.DATABASE_URL;
if (!url)
  throw new Error("DATABASE_URL not found in environment variables.");

export default defineConfig({
  out: './database/migrations',
  schema: './database/schema/*',
  dialect: 'postgresql',
  dbCredentials: { url },
});
