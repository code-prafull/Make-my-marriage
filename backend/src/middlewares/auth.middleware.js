import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";
import User from "../modules/users/user.model.js";

/**
 * Authentication middleware — reads the JWT cookie, verifies it and
 * attaches the current user to `req.user`.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw ApiError.unauthorized("You must be signed in to access this resource");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Your session is invalid or has expired");
  }

  const user = await User.findById(payload.sub).select("-password");
  if (!user || user.status !== "ACTIVE") {
    throw ApiError.unauthorized("Your account is not available");
  }

  req.user = user;
  next();
});

export default authenticate;
