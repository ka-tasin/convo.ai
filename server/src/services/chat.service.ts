import { IChatRepository } from "../repositories/interfaces/IChat.repository";
import { IMessage } from "../models/chat.model";

export class ChatService {
  constructor(private chatRepo: IChatRepository) {}

  async sendMessage(sender: string, receiver: string, content: string) {
    let chat = await this.chatRepo.findChatBetweenUsers(sender, receiver);
    const message: IMessage = {
      sender,
      receiver,
      content,
      createdAt: new Date(),
    };

    if (!chat) {
      chat = await this.chatRepo.createChat([sender, receiver]);
    }

    return await this.chatRepo.addMessage(chat.id, message);
  }

  async getChat(user1: string, user2: string) {
    return await this.chatRepo.findChatBetweenUsers(user1, user2);
  }
}
