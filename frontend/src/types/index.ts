export type ModelType = "image" | "video" | "audio";

export interface ModelCapability {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  badge?: "TOP" | "NEW" | "FREE";
  credits: number;
  icon: string;
  capabilities: string[];
  enabled: boolean;
}

export interface Effect {
  id: string;
  name: string;
  category: string;
  description: string;
  type: "image" | "video";
  thumbnail: string;
  preset: Record<string, unknown>;
}

export type GenerationStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type GenerationType = "image" | "video" | "audio";

export interface Asset {
  _id: string;
  userId: string;
  projectId?: string;
  generationId?: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  favorite: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Generation {
  _id: string;
  userId: string;
  projectId?: string;
  type: GenerationType;
  action: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  settings: Record<string, unknown>;
  inputAssets: string[];
  outputAssets: string[] | Asset[];
  status: GenerationStatus;
  progress: number;
  statusMessage: string;
  creditsUsed: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  plan: "free" | "basic" | "pro" | "enterprise";
  role: "user" | "admin";
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  read: boolean;
  link?: string;
  createdAt: string;
}
