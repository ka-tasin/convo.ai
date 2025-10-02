import { IUserRepository } from "../repositories/interfaces/IUser.repository";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async createUser(username: string, email: string) {
    return await this.userRepo.create({ username, email });
  }

  async findById(id: string) {
    return await this.userRepo.findById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepo.findByEmail(email);
  }
}
