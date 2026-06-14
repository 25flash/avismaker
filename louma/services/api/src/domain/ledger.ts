import { Prisma, Account, Transaction, TransactionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  AccountNotActiveError,
  AccountNotFoundError,
  CurrencyMismatchError,
  InsufficientFundsError,
  SameAccountTransferError,
} from "./errors";

type Tx = Prisma.TransactionClient;

export interface PostDoubleEntryParams {
  idempotencyKey: string;
  type: TransactionType;
  sourceAccountId: string;
  destAccountId: string;
  amount: bigint;
  currency: string;
  reference?: string;
  /** Whether the source account's balance must cover the amount (false for sandbox deposits funded by a system account). */
  enforceSourceFunds: boolean;
}

export interface PostDoubleEntryResult {
  transaction: Transaction;
  replayed: boolean;
}

/**
 * Posts a balanced double-entry transaction between two accounts:
 * debits sourceAccountId and credits destAccountId by `amount`.
 * Idempotent: replaying the same idempotencyKey returns the original
 * transaction without posting new entries (RAT §2/§3.3).
 */
export async function postDoubleEntry(
  tx: Tx,
  params: PostDoubleEntryParams,
): Promise<PostDoubleEntryResult> {
  if (params.sourceAccountId === params.destAccountId) {
    throw new SameAccountTransferError();
  }
  if (params.amount <= 0n) {
    throw new InsufficientFundsError();
  }

  const existing = await tx.transaction.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });
  if (existing) {
    return { transaction: existing, replayed: true };
  }

  // Lock both accounts in a deterministic order to avoid deadlocks between
  // concurrent operations that touch the same pair of accounts.
  const [firstId, secondId] = [params.sourceAccountId, params.destAccountId].sort();
  const locked = new Map<string, Account>();
  for (const id of [firstId, secondId]) {
    const rows = await tx.$queryRaw<Account[]>`
      SELECT * FROM "Account" WHERE id = ${id} FOR UPDATE
    `;
    const account = rows[0];
    if (!account) throw new AccountNotFoundError();
    locked.set(id, account);
  }

  const source = locked.get(params.sourceAccountId)!;
  const dest = locked.get(params.destAccountId)!;

  if (params.enforceSourceFunds && source.status !== "ACTIVE") {
    throw new AccountNotActiveError();
  }
  if (dest.status !== "ACTIVE") {
    throw new AccountNotActiveError();
  }
  if (source.currency !== params.currency || dest.currency !== params.currency) {
    throw new CurrencyMismatchError();
  }
  if (params.enforceSourceFunds && source.balance < params.amount) {
    throw new InsufficientFundsError();
  }

  const transaction = await tx.transaction.create({
    data: {
      id: uuidv4(),
      type: params.type,
      status: "SETTLED",
      idempotencyKey: params.idempotencyKey,
      sourceAccountId: source.id,
      destAccountId: dest.id,
      currency: params.currency,
      amount: params.amount,
      reference: params.reference,
    },
  });

  await tx.ledgerEntry.createMany({
    data: [
      {
        id: uuidv4(),
        accountId: source.id,
        direction: "DEBIT",
        currency: params.currency,
        amount: params.amount,
        txId: transaction.id,
      },
      {
        id: uuidv4(),
        accountId: dest.id,
        direction: "CREDIT",
        currency: params.currency,
        amount: params.amount,
        txId: transaction.id,
      },
    ],
  });

  await tx.account.update({
    where: { id: source.id },
    data: { balance: source.balance - params.amount },
  });
  await tx.account.update({
    where: { id: dest.id },
    data: { balance: dest.balance + params.amount },
  });

  return { transaction, replayed: false };
}

/**
 * Returns the system "sandbox external" account used as the counterparty for
 * simulated cash-in deposits (RAT: external integrations are mocked behind
 * a clean adapter boundary). Created lazily on first use.
 */
export async function getOrCreateSandboxExternalAccount(
  tx: Tx,
  currency: string,
): Promise<Account> {
  const rib = `SANDBOX-EXTERNAL-${currency}`;
  const existing = await tx.account.findUnique({ where: { rib } });
  if (existing) return existing;

  return tx.account.create({
    data: {
      id: uuidv4(),
      rib,
      currency,
      status: "ACTIVE",
      type: "SYSTEM",
      balance: 0n,
    },
  });
}
