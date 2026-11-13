/**
 * Standard application error with an HTTP status and machine-readable code.
 */
export default class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR", errors = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    if (errors) this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors) {
    return new ApiError(400, message, "BAD_REQUEST", errors);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message, "CONFLICT");
  }

  static unprocessable(message = "Validation failed", errors) {
    return new ApiError(422, message, "VALIDATION_ERROR", errors);
  }
}
