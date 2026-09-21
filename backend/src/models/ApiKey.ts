import { Schema, model, Document, Types } from "mongoose";

export interface IApiKey extends Document {
  userId: Types.ObjectId;
  label: string;
  keyPrefix: string;
  keyHash: string;
  revoked: boolean;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Default key" },
    keyPrefix: { type: String, required: true },
    keyHash: { type: String, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IApiKey>("ApiKey", ApiKeySchema);
