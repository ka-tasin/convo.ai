export interface OnlineUser {
  socketId: string;
  username: string;
}

export interface StoredUser {
  username: string;
  lastSeen?: number;
}

export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: number | undefined;
}

export interface Message {
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isChatGPT?: boolean;
}

export interface TypingData {
  userId: string;
  receiverId: string;
}

export interface AuthRequest extends Express.Request {
  user?: any;
  params?: any;
  headers: any;
}
