import ApiError from "../utils/ApiError.js";

/**
 * Zod validation middleware.
 * `schemas` may include `body`, `params` and `query`.
 * Validated (parsed) values replace the originals on the request.
 */
const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const source of ["params", "query", "body"]) {
    const schema = schemas[source];
    if (!schema) continue;

    const result = schema.safeParse(req[source]);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          field: `${source}.${issue.path.join(".")}`,
          message: issue.message,
        });
      }
    } else {
      // Express 5: req.query is a getter — define our own property instead
      if (source === "query") {
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        req[source] = result.data;
      }
    }
  }

  if (errors.length > 0) {
    return next(ApiError.unprocessable("Validation failed", errors));
  }

  return next();
};

export default validate;
