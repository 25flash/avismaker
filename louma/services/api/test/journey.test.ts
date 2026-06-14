import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

describe("end-to-end account journey", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers, deposits, transfers and lists history", async () => {
    const regA = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { phone: "+221701111111", pin: "1234", fullName: "Alice" },
    });
    expect(regA.statusCode).toBe(201);
    const a = regA.json();
    expect(a.account.balance).toBe(0);
    expect(a.account.rib).toMatch(/^SN\d{20}$/);

    const regB = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { phone: "+221702222222", pin: "5678", fullName: "Bob" },
    });
    expect(regB.statusCode).toBe(201);
    const b = regB.json();

    const tokenA = a.accessToken as string;
    const tokenB = b.accessToken as string;

    // Deposit
    const deposit = await app.inject({
      method: "POST",
      url: "/v1/accounts/me/deposit",
      headers: { authorization: `Bearer ${tokenA}`, "idempotency-key": "dep-1" },
      payload: { amount: 10000 },
    });
    expect(deposit.statusCode).toBe(200);
    expect(deposit.json().balance).toBe(10000);

    // Transfer A -> B
    const transfer = await app.inject({
      method: "POST",
      url: "/v1/transfers",
      headers: { authorization: `Bearer ${tokenA}`, "idempotency-key": "trf-1" },
      payload: { destination: b.account.rib, amount: 4000, currency: "XOF" },
    });
    expect(transfer.statusCode).toBe(200);
    expect(transfer.json().direction).toBe("DEBIT");

    // Replay same idempotency key
    const replay = await app.inject({
      method: "POST",
      url: "/v1/transfers",
      headers: { authorization: `Bearer ${tokenA}`, "idempotency-key": "trf-1" },
      payload: { destination: b.account.rib, amount: 4000, currency: "XOF" },
    });
    expect(replay.json().id).toBe(transfer.json().id);

    const accountA = await app.inject({
      method: "GET",
      url: "/v1/accounts/me",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(accountA.json().balance).toBe(6000);

    const accountB = await app.inject({
      method: "GET",
      url: "/v1/accounts/me",
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect(accountB.json().balance).toBe(4000);

    const historyA = await app.inject({
      method: "GET",
      url: "/v1/transactions",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(historyA.json()).toHaveLength(2);
  });

  it("rejects a transfer with insufficient funds", async () => {
    const regA = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { phone: "+221703333333", pin: "1234", fullName: "Carla" },
    });
    const regB = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { phone: "+221704444444", pin: "1234", fullName: "Dan" },
    });
    const a = regA.json();
    const b = regB.json();

    const transfer = await app.inject({
      method: "POST",
      url: "/v1/transfers",
      headers: { authorization: `Bearer ${a.accessToken}`, "idempotency-key": "trf-2" },
      payload: { destination: b.account.rib, amount: 100, currency: "XOF" },
    });
    expect(transfer.statusCode).toBe(422);
    expect(transfer.json().title).toBe("Insufficient funds");
  });

  it("rejects login with wrong PIN", async () => {
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { phone: "+221705555555", pin: "1234", fullName: "Eve" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { phone: "+221705555555", pin: "0000" },
    });
    expect(res.statusCode).toBe(401);
  });
});
