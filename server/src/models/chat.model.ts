import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sender: string;
  receiver: string;
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  participants: string[];
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [MessageSchema],
});

export default mongoose.model<IChat>("Chat", ChatSchema);
