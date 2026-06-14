import { FastifyInstance, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "@louma/shared";
import { register, login, refresh } from "./auth.service";
import { prisma } from "../../db";
import { serializeAccount } from "../../serializers";
import { z } from "zod";

export async function authRoutes(app: FastifyInstance) {
  app.post("/v1/auth/register", async (req, reply) => {
    const input = registerSchema.parse(req.body);
    const result = await register(app, input);
    await respondWithAuth(reply, result);
  });

  app.post("/v1/auth/login", async (req, reply) => {
    const input = loginSchema.parse(req.body);
    const result = await login(app, input);
    await respondWithAuth(reply, result);
  });

  app.post("/v1/auth/refresh", async (req, reply) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const tokens = await refresh(app, refreshToken);
    reply.send(tokens);
  });

  async function respondWithAuth(
    reply: FastifyReply,
    result: { accessToken: string; refreshToken: string; userId: string; accountId: string },
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: result.userId } });
    const account = await prisma.account.findUniqueOrThrow({ where: { id: result.accountId } });

    reply.code(201).send({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        kycLevel: user.kycLevel,
      },
      account: serializeAccount(account),
    });
  }
}
