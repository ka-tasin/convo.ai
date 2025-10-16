import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { Message } from "../types";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { sender, receiver, content, senderName } = req.body;
      if (!sender || !receiver || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const msg: Message = {
        senderId: sender,
        senderName: senderName || "User",
        receiverId: receiver,
        content,
        timestamp: Date.now(),
        isChatGPT: false,
      };

      await chatService.saveMessage(msg);

      res.json(msg);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async getChat(req: Request, res: Response) {
    try {
      const user1 = req.params.user1;
      const user2 = req.params.user2;

      if (!user1 || !user2) {
        return res.status(400).json({ message: "Missing user parameters" });
      }

      const messages = await chatService.getConversation(user1, user2);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
