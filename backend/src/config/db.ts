import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

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
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    "[db] connected successfully, readyState:",
    mongoose.connection.readyState
  );
}