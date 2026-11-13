import ApiError from "../utils/ApiError.js";
import env from "../config/environment.js";

const isDevelopment = env.NODE_ENV === "development";

/** Maps well-known library errors to safe API errors. */
function normalizeError(error) {
  if (error instanceof ApiError) return error;

  // Mongoose validation — 11000 is a duplicate key
  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable("Validation failed", errors);
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return ApiError.conflict(`An entry with this ${field} already exists`);
  }

  if (error?.name === "CastError") {
    return ApiError.badRequest("Invalid identifier provided");
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return ApiError.unauthorized("Your session is invalid or has expired");
  }

  return null;
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export default function errorHandler(err, req, res, _next) {
  const normalized = normalizeError(err);
  const statusCode = normalized?.statusCode || 500;
  const message = normalized?.message || "Something went wrong. Please try again.";
  const code = normalized?.code || "INTERNAL_ERROR";

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err);
  }

  const body = { success: false, message, error: { code } };
  if (normalized?.errors) body.error.errors = normalized.errors;
  if (isDevelopment && statusCode >= 500 && err?.stack) body.error.stack = err.stack;

  res.status(statusCode).json(body);
}
