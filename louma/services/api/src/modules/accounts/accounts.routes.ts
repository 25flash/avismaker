import { FastifyInstance, FastifyRequest } from "fastify";
import { depositSchema } from "@louma/shared";
import { prisma } from "../../db";
import { serializeAccount } from "../../serializers";
import { postDoubleEntry, getOrCreateSandboxExternalAccount } from "../../domain/ledger";
import { AccountNotFoundError } from "../../domain/errors";

export async function getCurrentAccount(req: FastifyRequest) {
  const userId = req.user.sub;
  const account = await prisma.account.findFirst({
    where: { userId, type: "STANDARD" },
  });
  if (!account) throw new AccountNotFoundError();
  return account;
}

export async function accountsRoutes(app: FastifyInstance) {
  app.get("/v1/accounts/me", { preHandler: app.authenticate }, async (req, reply) => {
    const account = await getCurrentAccount(req);
    reply.send(serializeAccount(account));
  });

  // Sandbox cash-in: simulates an external deposit (mobile money / agent
  // network) crediting the user's account. Real bank/PSP integration is out
  // of scope for Lot 1 (see docs/OPEN_QUESTIONS.md).
  app.post("/v1/accounts/me/deposit", { preHandler: app.authenticate }, async (req, reply) => {
    const input = depositSchema.parse(req.body);
    const idempotencyKey = req.headers["idempotency-key"];
    if (typeof idempotencyKey !== "string" || !idempotencyKey) {
      reply.code(400).type("application/problem+json").send({
        type: "about:blank",
        title: "Missing Idempotency-Key",
        status: 400,
        detail: "the Idempotency-Key header is required",
      });
      return;
    }

    const account = await getCurrentAccount(req);

    const updated = await prisma.$transaction(async (tx) => {
      const external = await getOrCreateSandboxExternalAccount(tx, account.currency);
      await postDoubleEntry(tx, {
        idempotencyKey,
        type: "DEPOSIT",
        sourceAccountId: external.id,
        destAccountId: account.id,
        amount: BigInt(input.amount),
        currency: account.currency,
        reference: input.reference,
        enforceSourceFunds: false,
      });
      return tx.account.findUniqueOrThrow({ where: { id: account.id } });
    });

    reply.send(serializeAccount(updated));
  });
}
