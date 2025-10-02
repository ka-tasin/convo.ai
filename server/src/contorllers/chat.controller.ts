import { Request, Response } from "express";
import { chatService } from "../config/ioc.config";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { sender, receiver, content } = req.body;
      if (!sender || !receiver || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const chat = await chatService.sendMessage(sender, receiver, content);
      res.json(chat);
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

      // Use the new helper to get just messages
      const messages = await chatService.getMessages(user1, user2);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
