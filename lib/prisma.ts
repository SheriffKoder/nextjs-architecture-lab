import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined | null;
};
/**
* Prisma Client configuration
*
* For Supabase:
* - Use DIRECT_URL (port 5432) for best compatibility with Prisma
*   Prisma uses prepared statements and transactions which work better
*   with direct connections than connection poolers
* - DATABASE_URL (port 6543, pgbouncer) can be used but may have limitations
*   with prepared statements and transactions
*/
// Get database URL from environment
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Initialize Prisma client
// Always create PrismaClient instance for build compatibility
// Will fail at runtime if DATABASE_URL is not set when actually used
let prisma: PrismaClient;

if (databaseUrl) {
  try {
    // Create a PostgreSQL connection pool (connectionTimeoutMillis helps avoid ETIMEDOUT on slow/cold starts)
    const pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 15_000,
    });
    const adapter = new PrismaPg(pool);
    
    prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        adapter,
        //// Log queries in development mode ////
        // log:
        //   process.env.NODE_ENV === "development"
        //     ? ["query", "error", "warn"]
        //     : ["error"],
        //// Log errors only ////
        log: ["error"],
      });
    
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  } catch (error) {
    // If initialization fails, create PrismaClient without adapter for build compatibility
    console.warn("Failed to initialize Prisma client with adapter:", error);
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: ["error"],
    });
    
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }
} else {
  // No database URL - still create PrismaClient instance for build compatibility
  // Will fail at runtime if DATABASE_URL is not set when actually used
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };