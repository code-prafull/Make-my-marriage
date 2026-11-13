import dotenv from "dotenv";

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/make-my-marriage",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_MAX_AGE_MS: Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
  CLIENT_URLS: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  SMTP: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  EMAIL_FROM: process.env.EMAIL_FROM || "MakeMyMarriage <no-reply@makemymarriage.local>",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to backend/.env (see .env.example).");
}

export default env;
