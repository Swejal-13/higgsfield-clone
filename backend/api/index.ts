import app from "../src/app";
import { connectDB } from "../src/config/db";

let dbPromise: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  if (!dbPromise) {
    dbPromise = connectDB();
  }

  await dbPromise;

  return app(req, res);
}