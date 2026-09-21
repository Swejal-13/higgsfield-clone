import { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  coverImage?: string;
  assetIds: Types.ObjectId[];
  generationIds: Types.ObjectId[];
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    assetIds: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
    generationIds: [{ type: Schema.Types.ObjectId, ref: "Generation" }],
  },
  { timestamps: true }
);

export default model<IProject>("Project", ProjectSchema);
