import app from "../src/app";
import { connectDB } from "../src/config/db";

let dbPromise: Promise<void> | null = null;

async function ensureDB() {
  if (!dbPromise) {
    dbPromise = connectDB().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  await dbPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureDB();
    return app(req, res);
  } catch (error) {
    console.error("[serverless] database initialization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
}