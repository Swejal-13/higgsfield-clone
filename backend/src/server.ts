import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function main() {
  console.log("[startup] server.ts loaded");

  await connectDB();

  console.log("[startup] database initialization finished");

  app.listen(env.port, () => {
    console.log(
      `Higgsfield API listening on http://localhost:${env.port}`
    );
  });
}

main().catch((err) => {
  console.error("[startup] FATAL ERROR:", err);
  process.exit(1);
});