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

  // Returns the chat object, including messages
  async getChat(user1: string, user2: string) {
    const chat = await this.chatRepo.findChatBetweenUsers(user1, user2);
    return chat || { id: null, users: [user1, user2], messages: [] };
  }

  // Helper to get just the messages array
  async getMessages(user1: string, user2: string) {
    const chat = await this.getChat(user1, user2);
    return chat.messages;
  }
}
