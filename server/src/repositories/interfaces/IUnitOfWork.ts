import { IUserRepository } from "./IUser.repository";
import { IChatRepository } from "./IChat.repository";

export interface IUnitOfWork {
  users: IUserRepository;
  chats: IChatRepository;
}
