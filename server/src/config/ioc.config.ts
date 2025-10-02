import { ChatRepository } from "../repositories/chat.repository";
import { UserRepository } from "../repositories/user.repository";
import { ChatService } from "../services/chat.service";
import { UserService } from "../services/user.service";
import { UnitOfWork } from "../repositories/unitOfWork";

export const userRepo = new UserRepository();
export const chatRepo = new ChatRepository();

export const uow = new UnitOfWork(userRepo, chatRepo);

export const userService = new UserService(userRepo);
export const chatService = new ChatService(chatRepo);
