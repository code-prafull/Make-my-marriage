import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import env from "../config/environment.js";

/** Signs the JWT used for cookie-based authentication. */
export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/** Verifies a JWT and returns its payload (throws when invalid/expired). */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/** Cookie options shared by set/clear so logout mirrors login exactly. */
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: "/",
  };
}

/** Sets the auth cookie after login/signup. */
export function setAuthCookie(res, token) {
  res.cookie("accessToken", token, authCookieOptions());
}

/** Clears the auth cookie on logout. */
export function clearAuthCookie(res) {
  res.clearCookie("accessToken", { ...authCookieOptions(), maxAge: undefined });
}

/** Cryptographically random raw token (for email verification / password reset). */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/** SHA-256 hash — only hashes are stored for sensitive tokens. */
export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
