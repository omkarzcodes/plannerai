import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 API ready on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully…`);

  // Stop accepting new connections, let in-flight requests finish.
  server.close(async () => {
    await prisma.$disconnect();
    console.log("HTTP server closed and database disconnected.");
    process.exit(0);
  });

  // Safety net: force-exit if something hangs.
  setTimeout(() => {
    console.error("Could not close in time — forcing shutdown.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
