import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/higgsfield",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-not-for-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  aiImageApiKey: process.env.AI_IMAGE_API_KEY || "",
  aiVideoApiKey: process.env.AI_VIDEO_API_KEY || "",
  aiAudioApiKey: process.env.AI_AUDIO_API_KEY || "",
  mockImageDurationMs: parseInt(process.env.MOCK_IMAGE_DURATION_MS || "4000", 10),
  mockVideoDurationMs: parseInt(process.env.MOCK_VIDEO_DURATION_MS || "8000", 10),
  mockAudioDurationMs: parseInt(process.env.MOCK_AUDIO_DURATION_MS || "3000", 10),
};

export const useMockImageProvider = !env.aiImageApiKey;
export const useMockVideoProvider = !env.aiVideoApiKey;
export const useMockAudioProvider = !env.aiAudioApiKey;
