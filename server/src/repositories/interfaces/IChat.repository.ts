import { IChat, IMessage } from "../../models/chat.model";

export interface IChatRepository {
  createChat(participants: string[]): Promise<IChat>;
  addMessage(chatId: string, message: IMessage): Promise<IChat>;
  findChatBetweenUsers(user1: string, user2: string): Promise<IChat | null>;
  findById(chatId: string): Promise<IChat | null>;
}
