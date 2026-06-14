import argon2 from "argon2";
import crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { FastifyInstance } from "fastify";
import { prisma } from "../../db";
import { generateRib } from "../../domain/rib";
import { config } from "../../config";
import { InvalidCredentialsError, PhoneAlreadyRegisteredError } from "../../domain/errors";
import type { RegisterInput, LoginInput } from "@louma/shared";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  accountId: string;
}

async function issueTokens(app: FastifyInstance, userId: string): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = app.jwt.sign({ sub: userId }, { expiresIn: config.accessTokenTtl });

  const refreshToken = uuidv4();
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      id: uuidv4(),
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

export async function register(app: FastifyInstance, input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new PhoneAlreadyRegisteredError();

  const pinHash = await argon2.hash(input.pin);

  const { user, account } = await prisma.$transaction(async (tx) => {
    const seqRow = await tx.accountSeq.upsert({
      where: { id: 1 },
      create: { id: 1, value: 1n },
      update: { value: { increment: 1n } },
    });

    const user = await tx.user.create({
      data: {
        id: uuidv4(),
        phone: input.phone,
        pinHash,
        fullName: input.fullName,
        kycLevel: 1,
      },
    });

    const account = await tx.account.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        rib: generateRib(seqRow.value),
        currency: "XOF",
        status: "ACTIVE",
        type: "STANDARD",
        balance: 0n,
      },
    });

    return { user, account };
  });

  const tokens = await issueTokens(app, user.id);
  return { ...tokens, userId: user.id, accountId: account.id };
}

export async function login(app: FastifyInstance, input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { phone: input.phone },
    include: { accounts: true },
  });
  if (!user) throw new InvalidCredentialsError();

  const valid = await argon2.verify(user.pinHash, input.pin);
  if (!valid) throw new InvalidCredentialsError();

  const account = user.accounts.find((a) => a.type === "STANDARD");
  if (!account) throw new InvalidCredentialsError();

  const tokens = await issueTokens(app, user.id);
  return { ...tokens, userId: user.id, accountId: account.id };
}

export async function refresh(
  app: FastifyInstance,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new InvalidCredentialsError();
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(app, stored.userId);
}
