import { IChatRepository } from "./interfaces/IChat.repository";
import Chat, { IChat, IMessage } from "../models/chat.model";

export class ChatRepository implements IChatRepository {
  async createChat(participants: string[]): Promise<IChat> {
    return await Chat.create({ participants, messages: [] });
  }

  async addMessage(chatId: string, message: IMessage): Promise<IChat> {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");
    chat.messages.push(message);
    await chat.save();
    return chat;
  }

  async findChatBetweenUsers(
    user1: string,
    user2: string
  ): Promise<IChat | null> {
    return await Chat.findOne({ participants: { $all: [user1, user2] } });
  }

  async findById(chatId: string): Promise<IChat | null> {
    return await Chat.findById(chatId);
  }
}
