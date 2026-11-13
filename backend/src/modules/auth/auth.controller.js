import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { setAuthCookie, clearAuthCookie, signToken } from "../../utils/token.js";
import * as authService from "./auth.service.js";

/** POST /api/v1/auth/signup */
export const signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.body);

  setAuthCookie(res, signToken({ sub: user._id.toString() }));

  return ApiResponse(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: { user: user.toSafeObject() },
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);

  setAuthCookie(res, signToken({ sub: user._id.toString() }));

  return ApiResponse(res, {
    message: "Login successful",
    data: { user: user.toSafeObject() },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);

  return ApiResponse(res, { message: "Logout successful" });
});

/** GET /api/v1/auth/me */
export const me = asyncHandler(async (req, res) => {
  return ApiResponse(res, { data: req.user.toSafeObject() });
});

/** POST /api/v1/auth/forgot-password */
export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);

  // Always the same response so emails cannot be enumerated
  return ApiResponse(res, {
    message: "If an account exists for that email, a reset link has been sent",
  });
});

/** POST /api/v1/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);

  return ApiResponse(res, { message: "Password updated successfully. You can now sign in." });
});
