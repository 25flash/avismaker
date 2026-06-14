// Amounts are always integers in the smallest unit of the currency.
// XOF has zero decimal places, so 1 XOF == 1 unit (no cents).
export const ZERO_DECIMAL_CURRENCIES = new Set(["XOF"]);

export function formatAmount(amount: number, currency: string): string {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  }
  return `${(amount / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}`;
}
