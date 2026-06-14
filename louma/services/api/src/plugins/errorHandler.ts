import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { DomainError } from "../domain/errors";

// RFC 7807 Problem Details error responses (ADR-0004).
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof DomainError) {
      reply.code(err.statusCode).type("application/problem+json").send({
        type: "about:blank",
        title: err.title,
        status: err.statusCode,
        detail: err.message,
      });
      return;
    }

    if (err instanceof ZodError) {
      reply.code(400).type("application/problem+json").send({
        type: "about:blank",
        title: "Invalid request",
        status: 400,
        detail: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
      return;
    }

    if ((err as { statusCode?: number }).statusCode) {
      const statusCode = (err as { statusCode: number }).statusCode;
      reply.code(statusCode).type("application/problem+json").send({
        type: "about:blank",
        title: statusCode < 500 ? "Invalid request" : "Internal server error",
        status: statusCode,
        detail: err.message,
      });
      return;
    }

    app.log.error(err);
    reply.code(500).type("application/problem+json").send({
      type: "about:blank",
      title: "Internal server error",
      status: 500,
    });
  });
}
