import Fastify from "fastify";
import { registerJwt } from "./plugins/jwt";
import { registerErrorHandler } from "./plugins/errorHandler";
import { authRoutes } from "./modules/auth/auth.routes";
import { accountsRoutes } from "./modules/accounts/accounts.routes";
import { transfersRoutes } from "./modules/transfers/transfers.routes";
import { transactionsRoutes } from "./modules/transactions/transactions.routes";

export async function buildApp() {
  const app = Fastify({ logger: true });

  registerErrorHandler(app);
  await registerJwt(app);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes);
  await app.register(accountsRoutes);
  await app.register(transfersRoutes);
  await app.register(transactionsRoutes);

  return app;
}
