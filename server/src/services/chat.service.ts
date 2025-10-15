import { Message } from "../types";
import { Message as MessageModel } from "../models/message.model";

export class ChatService {
  private conversations: Record<string, Message[]> = {};

  getConversationKey(id1: string, id2: string): string {
    return [id1, id2].sort().join("_");
  }

  async saveMessage(msg: Message): Promise<void> {
    const key = this.getConversationKey(msg.senderId, msg.receiverId);

    if (!this.conversations[key]) {
      this.conversations[key] = [];
    }
    this.conversations[key].push(msg);

    // Optional: Save to database
    try {
      await MessageModel.create({
        ...msg,
        conversationKey: key,
      });
    } catch (error) {
      console.error("Failed to save message to database:", error);
    }
  }

  async getConversation(userId: string, otherId: string): Promise<Message[]> {
    const key = this.getConversationKey(userId, otherId);

    if (this.conversations[key]) {
      return this.conversations[key];
    }

    // Load from database if not in memory
    try {
      const dbMessages = await MessageModel.find({ conversationKey: key })
        .sort({ timestamp: 1 })
        .lean();

      this.conversations[key] = dbMessages as Message[];
      return this.conversations[key];
    } catch (error) {
      console.error("Failed to load messages from database:", error);
      return [];
    }
  }

  getPendingMessages(userId: string, lastSeen: number): Message[] {
    const pendingMessages: Message[] = [];

    Object.entries(this.conversations).forEach(([key, msgs]) => {
      if (key.includes(userId)) {
        const userMessages = msgs.filter(
          (msg) =>
            msg.receiverId === userId &&
            !msg.isChatGPT &&
            msg.timestamp > lastSeen
        );
        pendingMessages.push(...userMessages);
      }
    });

    return pendingMessages;
  }
}

// ✅ Export the instance, not the class
export const chatService = new ChatService();
