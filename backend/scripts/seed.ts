/* eslint-disable no-console */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env";
import User from "../src/models/User";
import Project from "../src/models/Project";
import Generation from "../src/models/Generation";
import Asset from "../src/models/Asset";
import Notification from "../src/models/Notification";
import { IMAGE_MODELS, VIDEO_MODELS } from "../src/config/models.config";

const SAMPLE_PROMPTS = [
  "A futuristic city at night with neon reflections on wet streets",
  "Portrait of a warrior queen, cinematic lighting, ultra detailed",
  "A cabin in a snowy forest at golden hour",
  "Product shot of a minimalist perfume bottle on marble",
  "Astronaut floating above an alien ocean, dramatic sky",
  "Street fashion editorial, moody urban backdrop",
];

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log("[seed] connected to", env.mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Generation.deleteMany({}),
    Asset.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const demoPasswordHash = await bcrypt.hash("password123", 10);

  const admin = await User.create({
    name: "Ava Admin",
    email: "admin@higgsfield.demo",
    passwordHash: demoPasswordHash,
    credits: 999,
    plan: "enterprise",
    role: "admin",
  });

  const demoUser = await User.create({
    name: "Jordan Creator",
    email: "demo@higgsfield.demo",
    passwordHash: demoPasswordHash,
    credits: 240,
    plan: "pro",
    role: "user",
  });

  const project = await Project.create({
    userId: demoUser._id,
    name: "My Campaign",
    description: "Brand launch visuals for Q4",
  });

  for (let i = 0; i < 10; i++) {
    const isVideo = i % 3 === 0;
    const model = isVideo ? VIDEO_MODELS[i % VIDEO_MODELS.length] : IMAGE_MODELS[i % IMAGE_MODELS.length];
    const prompt = SAMPLE_PROMPTS[i % SAMPLE_PROMPTS.length];

    const generation = await Generation.create({
      userId: demoUser._id,
      projectId: project._id,
      type: isVideo ? "video" : "image",
      action: "generate",
      prompt,
      modelId: model.id,
      settings: { aspectRatio: "16:9" },
      status: "COMPLETED",
      progress: 100,
      statusMessage: "Completed",
      creditsUsed: model.credits,
      completedAt: new Date(Date.now() - i * 1000 * 60 * 60),
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 2),
    });

    const asset = await Asset.create({
      userId: demoUser._id,
      projectId: project._id,
      generationId: generation._id,
      type: isVideo ? "video" : "image",
      url: isVideo ? `/demo/videos/sample-${(i % 6) + 1}.mp4` : `/demo/images/sample-${(i % 12) + 1}.svg`,
      thumbnailUrl: `/demo/images/sample-${(i % 12) + 1}.svg`,
      filename: `${isVideo ? "video" : "image"}-${i}.${isVideo ? "mp4" : "png"}`,
      size: 102400,
      favorite: i % 4 === 0,
    });

    generation.outputAssets = [String(asset._id)];
    await generation.save();
  }

  await Notification.create([
    { userId: demoUser._id, title: "Welcome to Higgsfield", message: "Your creative workspace is ready.", type: "info" },
    { userId: demoUser._id, title: "Your image generation is ready", message: "\"A futuristic city at night\" finished rendering.", type: "success", link: "/history" },
    { userId: demoUser._id, title: "New model available", message: "Kling 3.0 is now available in Video Studio.", type: "info" },
  ]);

  console.log("[seed] done.");
  console.log("[seed] Demo login -> email: demo@higgsfield.demo  password: password123");
  console.log("[seed] Admin login -> email: admin@higgsfield.demo password: password123");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
