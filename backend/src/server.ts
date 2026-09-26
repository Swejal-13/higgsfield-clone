import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`\n  Forge API listening on http://localhost:${env.port}`);
    console.log(`  Health check:            http://localhost:${env.port}/api/health\n`);
  });
}

main();