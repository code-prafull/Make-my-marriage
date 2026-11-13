import axios from "axios";

/**
 * Central Axios instance for all backend communication.
 * Uses cookie-based auth (HttpOnly JWT), so credentials are always sent.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extracts a user-friendly error message from an API error.
 * Falls back to a generic message for network / unknown failures.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") return "Cannot reach the server. Please check your connection.";
  return fallback;
}

export default api;
