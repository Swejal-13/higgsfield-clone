import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    console.log(
      "[db] MONGODB_URI configured:",
      Boolean(process.env.MONGODB_URI)
    );

    console.log(
      "[db] Mongo host:",
      env.mongoUri.split("@")[1]?.split("/")[0] || "unknown"
    );

    mongoose.set("strictQuery", true);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("[db] connected successfully");
  } catch (err) {
    console.error("[db] connection failed:", (err as Error).message);
    throw err;
  }
}