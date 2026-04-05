import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Unexpected server error.";

  res.status(statusCode).json({
    message,
    details: process.env.NODE_ENV === "development" ? error.stack : undefined
  });
}

