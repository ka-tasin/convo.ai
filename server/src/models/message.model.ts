import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    default: Date.now,
  },
  isChatGPT: {
    type: Boolean,
    default: false,
  },
  conversationKey: {
    type: String,
    required: true,
    index: true,
  },
});

export const Message = mongoose.model("Message", messageSchema);
