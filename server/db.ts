import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Don't set custom WebSocket constructor in Replit environment to avoid SSL issues
// neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL options for database connection
const connectionString = process.env.DATABASE_URL;
const poolConfig: any = { connectionString };

// Add SSL configuration to handle self-signed certificates in development
if (connectionString?.includes('neon') || connectionString?.includes('replit')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });
