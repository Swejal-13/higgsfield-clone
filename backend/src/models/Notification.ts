import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  read: boolean;
  link?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["success", "error", "info", "warning"], default: "info" },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export default model<INotification>("Notification", NotificationSchema);
