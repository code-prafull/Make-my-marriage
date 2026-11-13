import ApiError from "../../utils/ApiError.js";
import User from "../users/user.model.js";
import { sendEmail } from "../../utils/mailer.js";
import { generateRandomToken, hashToken } from "../../utils/token.js";
import env from "../../config/environment.js";

// In-memory fallback for password reset tokens in dev (no DB collection needed for MVP demo).
// Production should persist these in the `passwordResets` collection.
const resetTokens = new Map(); // tokenHash -> { userId, expiresAt }

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function pruneExpiredTokens() {
  const now = Date.now();
  for (const [key, value] of resetTokens) {
    if (value.expiresAt <= now) resetTokens.delete(key);
  }
}

export async function signup({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });

  // Verification email is non-blocking — account works immediately (MVP rule)
  try {
    const token = generateRandomToken();
    await sendEmail({
      to: user.email,
      subject: "Welcome to MakeMyMarriage — verify your email",
      text: `Hi ${user.name},\n\nYour account has been created. Verify your email here:\n${env.FRONTEND_URL}/verify-email?token=${token}\n\n— MakeMyMarriage`,
    });
  } catch (error) {
    console.error("[auth] Verification email failed:", error.message);
  }

  return user;
}

export async function login({ email, password: candidatePassword }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw ApiError.forbidden("This account is not active");
  }

  const passwordMatches = await user.comparePassword(candidatePassword);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return user;
}

export async function requestPasswordReset(email) {
  pruneExpiredTokens();

  const user = await User.findOne({ email });
  // Never reveal whether the email exists
  if (!user) return { sent: true };

  const rawToken = generateRandomToken();
  resetTokens.set(hashToken(rawToken), {
    userId: user._id.toString(),
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your MakeMyMarriage password",
      text: `Hi ${user.name},\n\nReset your password (valid for 30 minutes):\n${env.FRONTEND_URL}/reset-password?token=${rawToken}\n\nIf you didn't request this, ignore this email.\n\n— MakeMyMarriage`,
    });
  } catch (error) {
    console.error("[auth] Reset email failed:", error.message);
  }

  return { sent: true };
}

export async function resetPassword({ token, password }) {
  pruneExpiredTokens();

  const key = hashToken(token);
  const record = resetTokens.get(key);

  if (!record || record.expiresAt <= Date.now()) {
    if (record) resetTokens.delete(key);
    throw ApiError.badRequest("This reset link is invalid or has expired");
  }

  const user = await User.findById(record.userId).select("+password");
  if (!user || user.status !== "ACTIVE") {
    resetTokens.delete(key);
    throw ApiError.badRequest("This reset link is invalid or has expired");
  }

  user.password = password; // hashed by the pre-save hook
  await user.save();
  resetTokens.delete(key);

  return user;
}
