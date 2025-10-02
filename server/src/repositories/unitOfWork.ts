import { IUnitOfWork } from "./interfaces/IUnitOfWork";
import { IUserRepository } from "./interfaces/IUser.repository";
import { IChatRepository } from "./interfaces/IChat.repository";

export class UnitOfWork implements IUnitOfWork {
  constructor(public users: IUserRepository, public chats: IChatRepository) {}
}
