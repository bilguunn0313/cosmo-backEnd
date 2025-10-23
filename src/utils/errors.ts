// Custom error classes for better error handling

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class OdooConnectionError extends AppError {
  constructor(message = "Failed to connect to ERP system") {
    super(503, message);
    this.name = "OdooConnectionError";
  }
}
