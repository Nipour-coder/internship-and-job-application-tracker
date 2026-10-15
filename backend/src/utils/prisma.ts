import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export async function testDbConnection(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl || dbUrl.includes("ep-sample") || dbUrl.includes("dummy")) {
    return false;
  }
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 6000)
    );
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeoutPromise]);
    return true;
  } catch (error) {
    console.warn("Neon connection probe error:", (error as Error).message);
    return false;
  }
}
