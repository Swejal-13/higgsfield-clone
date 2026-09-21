import { Schema, model, Document, Types } from "mongoose";

export interface IAsset extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  generationId?: Types.ObjectId;
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  favorite: boolean;
  metadata: Record<string, unknown>;
}

const AssetSchema = new Schema<IAsset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    generationId: { type: Schema.Types.ObjectId, ref: "Generation" },
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    filename: { type: String, required: true },
    size: { type: Number, default: 0 },
    favorite: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default model<IAsset>("Asset", AssetSchema);
