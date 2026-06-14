import { execSync } from "node:child_process";
import { beforeAll, beforeEach, afterAll } from "vitest";
import { prisma } from "../src/db";

beforeAll(() => {
  execSync("pnpm prisma migrate deploy", {
    cwd: __dirname + "/..",
    env: process.env,
    stdio: "inherit",
  });
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "LedgerEntry", "Transaction", "RefreshToken", "Account", "User", "AccountSeq" RESTART IDENTITY CASCADE`,
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
