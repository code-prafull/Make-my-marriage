import mongoose from "mongoose";
import env from "./environment.js";

/**
 * Connects to MongoDB and keeps the connection lifecycle simple.
 */
export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI);

  console.log(`[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on("error", (error) => {
    console.error("[db] MongoDB connection error:", error.message);
  });
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
