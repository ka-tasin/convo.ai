import { OnlineUser, StoredUser, User } from "../types";

export class UserService {
  private onlineUsers: Record<string, OnlineUser> = {};
  private allUsers: Record<string, StoredUser> = {};

  registerUser(userId: string, username: string, socketId: string): void {
    if (!this.allUsers[userId]) {
      this.allUsers[userId] = { username, lastSeen: Date.now() };
    } else {
      this.allUsers[userId]!.username = username;
      this.allUsers[userId]!.lastSeen = Date.now();
    }

    this.onlineUsers[userId] = { socketId, username };
  }

  removeUser(socketId: string): string | null {
    let disconnectedUserId: string | null = null;

    for (const id in this.onlineUsers) {
      const user = this.onlineUsers[id];
      if (user && user.socketId === socketId) {
        disconnectedUserId = id;
        delete this.onlineUsers[id];
        break;
      }
    }

    if (disconnectedUserId && this.allUsers[disconnectedUserId]) {
      this.allUsers[disconnectedUserId]!.lastSeen = Date.now();
    }

    return disconnectedUserId;
  }

  getOnlineUsers(): Array<{ id: string; username: string }> {
    return Object.entries(this.onlineUsers).map(([id, data]) => ({
      id,
      username: data.username,
    }));
  }

  getAllUsers(): User[] {
    return Object.entries(this.allUsers).map(([id, data]) => ({
      id,
      username: data.username,
      isOnline: !!this.onlineUsers[id],
      lastSeen: data.lastSeen,
    }));
  }

  getUserStatus(userId: string): {
    isOnline: boolean;
    lastSeen?: number;
    username?: string;
  } {
    const isOnline = !!this.onlineUsers[userId];
    const userData = this.allUsers[userId];

    const result: { isOnline: boolean; lastSeen?: number; username?: string } =
      { isOnline };
    if (userData?.lastSeen !== undefined) {
      result.lastSeen = userData.lastSeen;
    }
    if (userData?.username !== undefined) {
      result.username = userData.username;
    }
    return result;
  }

  getUserSocketId(userId: string): string | null {
    return this.onlineUsers[userId]?.socketId || null;
  }

  isUserOnline(userId: string): boolean {
    return !!this.onlineUsers[userId];
  }
}

export const userService = new UserService();
