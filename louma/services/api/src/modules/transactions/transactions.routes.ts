import { FastifyInstance } from "fastify";
import { prisma } from "../../db";
import { serializeTransaction } from "../../serializers";
import { getCurrentAccount } from "../accounts/accounts.routes";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/v1/transactions", { preHandler: app.authenticate }, async (req, reply) => {
    const account = await getCurrentAccount(req);

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ sourceAccountId: account.id }, { destAccountId: account.id }],
      },
      include: { sourceAccount: true, destAccount: true },
      orderBy: { createdAt: "desc" },
    });

    reply.send(transactions.map((tx) => serializeTransaction(tx, account.id)));
  });
}
