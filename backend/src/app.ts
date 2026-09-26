import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/error";

import authRoutes from "./routes/auth.routes";
import imageRoutes from "./routes/images.routes";
import videoRoutes from "./routes/videos.routes";
import audioRoutes from "./routes/audio.routes";
import generationRoutes from "./routes/generations.routes";
import assetRoutes from "./routes/assets.routes";
import projectRoutes from "./routes/projects.routes";
import creditRoutes from "./routes/credits.routes";
import modelRoutes from "./routes/models.routes";
import effectRoutes from "./routes/effects.routes";
import notificationRoutes from "./routes/notifications.routes";
import settingsRoutes from "./routes/settings.routes";
import adminRoutes from "./routes/admin.routes";

const app: Application = express();

app.set("trust proxy", 1);


app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Static demo + uploaded media
app.use("/demo", express.static(path.join(__dirname, "..", "public", "demo")));
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Forge API is running", env: env.nodeEnv }));

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/generations", generationRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/effects", effectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
