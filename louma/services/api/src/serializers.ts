import { Account, Transaction } from "@prisma/client";
import type { Account as AccountDto, Transaction as TransactionDto } from "@louma/shared";

export function serializeAccount(a: Account): AccountDto {
  return {
    id: a.id,
    rib: a.rib,
    currency: a.currency,
    status: a.status,
    balance: Number(a.balance),
    createdAt: a.createdAt.toISOString(),
  };
}

export function serializeTransaction(
  tx: Transaction & { sourceAccount: Account; destAccount: Account },
  forAccountId: string,
): TransactionDto {
  const direction = tx.sourceAccountId === forAccountId ? "DEBIT" : "CREDIT";
  const counterparty = direction === "DEBIT" ? tx.destAccount : tx.sourceAccount;
  return {
    id: tx.id,
    type: tx.type,
    status: tx.status,
    direction,
    amount: Number(tx.amount),
    currency: tx.currency,
    counterpartyRib: counterparty.type === "SYSTEM" ? null : counterparty.rib,
    reference: tx.reference,
    createdAt: tx.createdAt.toISOString(),
  };
}
