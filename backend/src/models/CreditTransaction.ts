import { Schema, model, Document, Types } from "mongoose";

export interface ICreditTransaction extends Document {
  userId: Types.ObjectId;
  amount: number; // negative = spend, positive = grant/refund
  reason: string;
  generationId?: Types.ObjectId;
  balanceAfter: number;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    generationId: { type: Schema.Types.ObjectId, ref: "Generation" },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model<ICreditTransaction>("CreditTransaction", CreditTransactionSchema);
