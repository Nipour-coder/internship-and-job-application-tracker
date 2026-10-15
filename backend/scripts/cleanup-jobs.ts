import { prisma } from "../src/utils/prisma";

async function main() {
  console.log("Checking and cleaning non-South African or expired jobs...");

  // 1. Delete jobs that are explicitly outside South Africa and not remote
  const deletedNonSA = await prisma.job.deleteMany({
    where: {
      AND: [
        { isRemote: false },
        {
          NOT: {
            OR: [
              { location: { contains: "South Africa", mode: "insensitive" } },
              { location: { contains: "Johannesburg", mode: "insensitive" } },
              { location: { contains: "Cape Town", mode: "insensitive" } },
              { location: { contains: "Durban", mode: "insensitive" } },
              { location: { contains: "Pretoria", mode: "insensitive" } },
              { location: { contains: "Sandton", mode: "insensitive" } },
              { location: { contains: "Midrand", mode: "insensitive" } },
              { location: { contains: "Stellenbosch", mode: "insensitive" } },
              { location: { contains: "Centurion", mode: "insensitive" } },
              { location: { contains: "Bloemfontein", mode: "insensitive" } },
              { location: { contains: "Gauteng", mode: "insensitive" } },
            ],
          },
        },
      ],
    },
  });
  console.log(`Deleted ${deletedNonSA.count} non-South African jobs.`);

  // 2. Delete jobs whose closing date has passed
  const now = new Date();
  const deletedExpired = await prisma.job.deleteMany({
    where: {
      closingDate: {
        lt: now,
      },
    },
  });
  console.log(`Deleted ${deletedExpired.count} expired jobs.`);

  // 3. Count remaining active South African jobs
  const remainingCount = await prisma.job.count();
  console.log(`Active live South African jobs in Neon DB: ${remainingCount}`);

  const sample = await prisma.job.findMany({
    take: 5,
    select: { title: true, company: true, location: true, closingDate: true },
  });
  console.log("Sample active jobs:", JSON.stringify(sample, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
