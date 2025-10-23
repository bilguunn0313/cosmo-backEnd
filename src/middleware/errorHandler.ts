import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = "Internal server error";
  let isOperational = false;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error details
  console.error("Error:", {
    name: err.name,
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prepare response
  const response: ErrorResponse = {
    success: false,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === "development") {
    response.error = err.message;
    response.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(response);
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (): void => {
  process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // In production, you might want to gracefully shutdown
    // process.exit(1);
  });
};

// Handle uncaught exceptions
export const handleUncaughtException = (): void => {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    // In production, gracefully shutdown
    // process.exit(1);
  });
};
