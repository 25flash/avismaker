import {
  AuthResponse,
  Account,
  Transaction,
  LoginInput,
  RegisterInput,
  DepositInput,
  TransferInput,
} from "./schemas";

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail?: string,
  ) {
    super(detail ?? title);
  }
}

export class ApiClient {
  constructor(private opts: ApiClientOptions) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };
    const token = this.opts.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${this.opts.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.opts.onUnauthorized?.();
    }

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      throw new ApiError(res.status, problem.title ?? res.statusText, problem.detail);
    }

    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }

  register(input: RegisterInput) {
    return this.request<AuthResponse>("POST", "/v1/auth/register", input);
  }

  login(input: LoginInput) {
    return this.request<AuthResponse>("POST", "/v1/auth/login", input);
  }

  refresh(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>(
      "POST",
      "/v1/auth/refresh",
      { refreshToken },
    );
  }

  getMyAccount() {
    return this.request<Account>("GET", "/v1/accounts/me");
  }

  deposit(input: DepositInput, idempotencyKey: string) {
    return this.request<Account>("POST", "/v1/accounts/me/deposit", input, {
      "Idempotency-Key": idempotencyKey,
    });
  }

  transfer(input: TransferInput, idempotencyKey: string) {
    return this.request<Transaction>("POST", "/v1/transfers", input, {
      "Idempotency-Key": idempotencyKey,
    });
  }

  getMyTransactions() {
    return this.request<Transaction[]>("GET", "/v1/transactions");
  }
}
