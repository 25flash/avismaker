import { z } from "zod";

// --- Auth ---

export const phoneSchema = z
  .string()
  .regex(/^\+221[67]\d{8}$/, "Numéro Sénégalais attendu, format +221XXXXXXXXX");

export const pinSchema = z.string().regex(/^\d{4,6}$/, "PIN à 4-6 chiffres");

export const registerSchema = z.object({
  phone: phoneSchema,
  pin: pinSchema,
  fullName: z.string().min(2).max(120),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phone: phoneSchema,
  pin: pinSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

// --- Accounts ---

export const accountSchema = z.object({
  id: z.string(),
  rib: z.string(),
  currency: z.string(),
  status: z.enum(["ACTIVE", "FROZEN", "CLOSED"]),
  balance: z.number().int(),
  createdAt: z.string(),
});
export type Account = z.infer<typeof accountSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    phone: z.string(),
    fullName: z.string(),
    kycLevel: z.number(),
  }),
  account: accountSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

// --- Deposits (sandbox) ---

export const depositSchema = z.object({
  amount: z.number().int().positive(),
  reference: z.string().max(140).optional(),
});
export type DepositInput = z.infer<typeof depositSchema>;

// --- Transfers ---

export const transferSchema = z.object({
  destination: z.string().min(3).max(64), // RIB or phone number of the recipient
  amount: z.number().int().positive(),
  currency: z.string().default("XOF"),
  reference: z.string().max(140).optional(),
});
export type TransferInput = z.infer<typeof transferSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["TRANSFER", "DEPOSIT"]),
  status: z.string(),
  direction: z.enum(["DEBIT", "CREDIT"]),
  amount: z.number().int(),
  currency: z.string(),
  counterpartyRib: z.string().nullable(),
  reference: z.string().nullable(),
  createdAt: z.string(),
});
export type Transaction = z.infer<typeof transactionSchema>;
