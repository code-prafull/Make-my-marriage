import app from "./app.js";
import env from "./config/environment.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

async function start() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`[server] API running on http://localhost:${env.PORT}/api/v1`);
      console.log(`[server] Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[server] ${signal} received — shutting down…`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[server] Failed to start:", error.message);
    process.exit(1);
  }
}

start();
