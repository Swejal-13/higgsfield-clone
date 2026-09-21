import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log(`[db] connected -> ${env.mongoUri}`);
  } catch (err) {
    console.error("[db] connection failed:", (err as Error).message);
    console.error(
      "[db] Make sure MongoDB is running locally or set MONGODB_URI to an Atlas connection string in backend/.env"
    );
    if (env.nodeEnv === "production") process.exit(1);
  }
}
