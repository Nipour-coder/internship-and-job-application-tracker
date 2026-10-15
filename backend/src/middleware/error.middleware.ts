import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Unhandled API Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected server error occurred. Please try again later.";

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
