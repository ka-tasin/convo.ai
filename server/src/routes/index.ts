import { Router } from "express";
import { ChatController } from "../contorllers/chat.controller";

const router = Router();

const chatController = new ChatController();

router.post("/send", (req, res) => chatController.sendMessage(req, res));
router.get("/:user1/:user2", (req, res) => chatController.getChat(req, res));

export default router;
