import { Schema, model, Document, Types } from "mongoose";

export type GenerationType = "image" | "video" | "audio";
export type GenerationStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface IGeneration extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  type: GenerationType;
  action: string; // generate | edit | inpaint | upscale | variation | image-to-video | motion-control | extend
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  settings: Record<string, unknown>;
  inputAssets: string[];
  outputAssets: string[];
  status: GenerationStatus;
  progress: number;
  statusMessage: string;
  creditsUsed: number;
  error?: string;
  completedAt?: Date;
}

const GenerationSchema = new Schema<IGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    action: { type: String, default: "generate" },
    prompt: { type: String, default: "" },
    negativePrompt: { type: String, default: "" },
    modelId: { type: String, required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
    inputAssets: [{ type: String }],
    outputAssets: [{ type: String }],
    status: { type: String, enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"], default: "QUEUED" },
    progress: { type: Number, default: 0 },
    statusMessage: { type: String, default: "Preparing prompt..." },
    creditsUsed: { type: Number, default: 0 },
    error: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IGeneration>("Generation", GenerationSchema);
