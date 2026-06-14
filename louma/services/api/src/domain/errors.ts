export class DomainError extends Error {
  constructor(
    public statusCode: number,
    public title: string,
    message: string,
  ) {
    super(message);
  }
}

export class InvalidAmountError extends DomainError {
  constructor() {
    super(400, "Invalid request", "amount must be a positive integer");
  }
}

export class CurrencyMismatchError extends DomainError {
  constructor() {
    super(400, "Invalid request", "currency mismatch between accounts and amount");
  }
}

export class InsufficientFundsError extends DomainError {
  constructor() {
    super(422, "Insufficient funds", "source account balance does not cover the amount");
  }
}

export class AccountNotFoundError extends DomainError {
  constructor() {
    super(404, "Account not found", "account not found");
  }
}

export class AccountNotActiveError extends DomainError {
  constructor() {
    super(409, "Account not active", "account is not active");
  }
}

export class SameAccountTransferError extends DomainError {
  constructor() {
    super(400, "Invalid request", "source and destination accounts must differ");
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(401, "Invalid credentials", "phone number or PIN is incorrect");
  }
}

export class PhoneAlreadyRegisteredError extends DomainError {
  constructor() {
    super(409, "Phone already registered", "an account already exists for this phone number");
  }
}

export class RecipientNotFoundError extends DomainError {
  constructor() {
    super(404, "Recipient not found", "no account matches the given RIB or phone number");
  }
}
