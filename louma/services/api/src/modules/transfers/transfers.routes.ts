import { FastifyInstance } from "fastify";
import { transferSchema } from "@louma/shared";
import { prisma } from "../../db";
import { serializeTransaction } from "../../serializers";
import { postDoubleEntry } from "../../domain/ledger";
import { RecipientNotFoundError, CurrencyMismatchError } from "../../domain/errors";
import { getCurrentAccount } from "../accounts/accounts.routes";

export async function transfersRoutes(app: FastifyInstance) {
  app.post("/v1/transfers", { preHandler: app.authenticate }, async (req, reply) => {
    const input = transferSchema.parse(req.body);
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

    const source = await getCurrentAccount(req);

    const dest = await prisma.account.findFirst({
      where: {
        OR: [{ rib: input.destination }, { user: { phone: input.destination } }],
        type: "STANDARD",
      },
    });
    if (!dest) throw new RecipientNotFoundError();
    if (input.currency !== source.currency) throw new CurrencyMismatchError();

    const { transaction } = await prisma.$transaction(async (tx) => {
      return postDoubleEntry(tx, {
        idempotencyKey,
        type: "TRANSFER",
        sourceAccountId: source.id,
        destAccountId: dest.id,
        amount: BigInt(input.amount),
        currency: input.currency,
        reference: input.reference,
        enforceSourceFunds: true,
      });
    });

    const full = await prisma.transaction.findUniqueOrThrow({
      where: { id: transaction.id },
      include: { sourceAccount: true, destAccount: true },
    });

    reply.send(serializeTransaction(full, source.id));
  });
}
