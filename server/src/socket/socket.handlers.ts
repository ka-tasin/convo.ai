import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { userService } from "../services/user.service";
import { chatService } from "../services/chat.service";
import { aiService } from "../services/ai.service";
import { Message, TypingData } from "../types";

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Get all users (for new connections)
    socket.on("getAllUsers", () => {
      io.emit("allUsers", userService.getAllUsers());
    });

    socket.on("registerUser", (token: string) => {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        userService.registerUser(decoded.id, decoded.username, socket.id);

        // Emit updated user lists
        io.emit("onlineUsers", userService.getOnlineUsers());
        io.emit("allUsers", userService.getAllUsers());

        // Check for pending messages
        const userData = userService.getUserStatus(decoded.id);
        if (userData.lastSeen) {
          const pendingMessages = chatService.getPendingMessages(
            decoded.id,
            userData.lastSeen
          );
          if (pendingMessages.length > 0) {
            console.log(
              `Delivering ${pendingMessages.length} pending messages to ${decoded.username}`
            );
            pendingMessages.forEach((msg) => {
              socket.emit("receiveMessage", msg);
            });
          }
        }
      } catch (err) {
        console.log("Invalid token during registration");
      }
    });

    socket.on("loadConversation", async ({ userId, otherId }) => {
      const conversation = await chatService.getConversation(userId, otherId);
      socket.emit("conversationLoaded", conversation);
    });

    socket.on("sendMessage", async (msg: Message) => {
      await chatService.saveMessage(msg);

      const receiverSocketId = userService.getUserSocketId(msg.receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", msg);
        console.log(`Message delivered immediately to ${msg.receiverId}`);
      } else {
        console.log(`Message stored for offline user ${msg.receiverId}`);
      }

      socket.emit("receiveMessage", msg);

      // AI response logic
      const isAskingAI =
        msg.content.toLowerCase().startsWith("@chatgpt") ||
        msg.content.toLowerCase().startsWith("@ai") ||
        msg.content.toLowerCase().startsWith("@gpt") ||
        msg.content.toLowerCase().startsWith("@assistant") ||
        msg.content.trim().endsWith("?");

      if (isAskingAI) {
        await handleAIResponse(msg, socket, receiverSocketId);
      }
    });

    // User typing indicators
    socket.on("typingStart", (data: TypingData) => {
      const receiverSocketId = userService.getUserSocketId(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: data.userId,
          isTyping: true,
        });
      }
    });

    socket.on("typingStop", (data: TypingData) => {
      const receiverSocketId = userService.getUserSocketId(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: data.userId,
          isTyping: false,
        });
      }
    });

    // Get user status
    socket.on("getUserStatus", (userId: string) => {
      const status = userService.getUserStatus(userId);
      socket.emit("userStatus", { userId, ...status });
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = userService.removeUser(socket.id);

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} went offline`);

        io.emit("onlineUsers", userService.getOnlineUsers());
        io.emit("allUsers", userService.getAllUsers());
      }

      console.log("Client disconnected:", socket.id);
    });
  });
};

async function handleAIResponse(
  msg: Message,
  socket: Socket,
  receiverSocketId: string | null
) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    let question = msg.content;
    const prefixes = ["@chatgpt", "@ai", "@gpt", "@assistant"];

    for (const prefix of prefixes) {
      if (question.toLowerCase().startsWith(prefix)) {
        question = question.substring(prefix.length).trim();
        break;
      }
    }

    const aiResponse = await aiService.getAIResponse(
      question,
      chatService.getConversationKey(msg.senderId, msg.receiverId),
      msg.senderName,
      "User"
    );

    const aiMsg: Message = {
      senderId: "ai",
      senderName: "AI Assistant",
      receiverId: msg.receiverId,
      content: aiResponse,
      timestamp: Date.now(),
      isChatGPT: true,
    };

    await chatService.saveMessage(aiMsg);

    socket.emit("receiveMessage", aiMsg);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("receiveMessage", aiMsg);
    }
  } catch (error) {
    console.error("Error in AI processing:", error);
  }
}
