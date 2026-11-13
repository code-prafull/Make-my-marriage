import api from "./api";

/**
 * Authentication service — mirrors POST /api/v1/auth endpoints
 * defined in the API Design Document.
 */
export const authService = {
  /** POST /auth/signup — register a new user */
  signup: (payload) => api.post("/auth/signup", payload).then((res) => res.data),

  /** POST /auth/login — authenticate and set HttpOnly cookie */
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),

  /** POST /auth/logout — clear the auth cookie */
  logout: () => api.post("/auth/logout").then((res) => res.data),

  /** GET /auth/me — fetch the current session user */
  me: () => api.get("/auth/me").then((res) => res.data),
};
