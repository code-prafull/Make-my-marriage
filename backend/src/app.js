import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "./config/environment.js";
import apiRoutes from "./routes/index.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// CORS — credentials (cookies) enabled for the frontend origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no origin) and configured frontend URLs
      if (!origin || env.CLIENT_URLS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies (JWT auth)
app.use(cookieParser());

// Rate limiting
app.use("/api", apiLimiter);

// Routes: /api/v1/...
app.use("/api/v1", apiRoutes);

// 404 for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API route not found", error: { code: "NOT_FOUND" } });
});

// Centralized error handling (must be last)
app.use(errorHandler);

export default app;
