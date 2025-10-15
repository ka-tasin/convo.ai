import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import OpenAI from "openai";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST"] }));
app.use(express.json());
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ------------------ Online Users ------------------
interface OnlineUser {
  socketId: string;
  username: string;
}
const onlineUsers: Record<string, OnlineUser> = {};
const emitOnlineUsers = () => {
  const users = Object.entries(onlineUsers).map(([id, data]) => ({
    id,
    username: data.username,
  }));
  io.emit("onlineUsers", users);
};

// ------------------ Conversations ------------------
interface Message {
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isChatGPT?: boolean;
}

// In-memory storage for demo
const conversations: Record<string, Message[]> = {};

const getConversationKey = (id1: string, id2: string) =>
  [id1, id2].sort().join("_");

// ChatGPT conversation context storage
const chatGPTContexts: Record<string, string> = {};

// Function to get ChatGPT response
async function getChatGPTResponse(
  conversationKey: string,
  userMessage: string,
  userName: string,
  otherUserName: string
): Promise<string> {
  try {
    // Build or update conversation context
    if (!chatGPTContexts[conversationKey]) {
      chatGPTContexts[
        conversationKey
      ] = `You are participating in a conversation between ${userName} and ${otherUserName}. You are an AI assistant that can help answer questions and provide information. Keep your responses concise and natural in a group chat setting.`;
    }

    // Get recent conversation history for context
    const recentMessages = conversations[conversationKey]?.slice(-10) || [];
    const conversationHistory = recentMessages
      .map((msg) => `${msg.senderName}: ${msg.content}`)
      .join("\n");

    const prompt = `${chatGPTContexts[conversationKey]}

Recent conversation:
${conversationHistory}
${userName}: ${userMessage}

AI:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: chatGPTContexts[conversationKey],
        },
        {
          role: "user",
          content: `${conversationHistory}\n${userName}: ${userMessage}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("ChatGPT API error:", error);
    return "I'm experiencing technical difficulties right now. Please try again later.";
  }
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("registerUser", (token: string) => {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      onlineUsers[decoded.id] = {
        socketId: socket.id,
        username: decoded.username,
      };
      emitOnlineUsers();
    } catch (err) {
      console.log("Invalid token");
    }
  });

  socket.on("loadConversation", ({ userId, otherId }) => {
    const key = getConversationKey(userId, otherId);
    socket.emit("conversationLoaded", conversations[key] || []);
  });

  socket.on("sendMessage", async (msg: Message) => {
    // Save message
    const key = getConversationKey(msg.senderId, msg.receiverId);
    if (!conversations[key]) conversations[key] = [];
    conversations[key].push(msg);

    // Emit to receiver
    const receiver = onlineUsers[msg.receiverId];
    if (receiver) io.to(receiver.socketId).emit("receiveMessage", msg);

    // Emit back to sender
    socket.emit("receiveMessage", msg);

    // Check if message is asking ChatGPT (starts with @chatgpt, @ai, @gpt, or contains question mark)
    const isAskingChatGPT =
      msg.content.toLowerCase().startsWith("@chatgpt") ||
      msg.content.toLowerCase().startsWith("@ai") ||
      msg.content.toLowerCase().startsWith("@gpt") ||
      msg.content.includes("?");

    if (isAskingChatGPT) {
      try {
        const senderUser = onlineUsers[msg.senderId];
        const receiverUser = onlineUsers[msg.receiverId];

        if (senderUser && receiverUser) {
          // Remove the trigger prefix if present
          let question = msg.content;
          if (question.toLowerCase().startsWith("@chatgpt ")) {
            question = question.substring("@chatgpt ".length);
          } else if (question.toLowerCase().startsWith("@ai ")) {
            question = question.substring("@ai ".length);
          } else if (question.toLowerCase().startsWith("@gpt ")) {
            question = question.substring("@gpt ".length);
          }

          const chatGPTResponse = await getChatGPTResponse(
            key,
            question,
            senderUser.username,
            receiverUser.username
          );

          // Create ChatGPT message
          const chatGPTMsg: Message = {
            senderId: "chatgpt",
            senderName: "ChatGPT",
            receiverId: msg.receiverId,
            content: chatGPTResponse,
            timestamp: Date.now(),
            isChatGPT: true,
          };

          // Save ChatGPT response to conversation
          conversations[key].push(chatGPTMsg);

          // Send ChatGPT response to both users
          io.to(socket.id).emit("receiveMessage", chatGPTMsg);
          if (receiver) {
            io.to(receiver.socketId).emit("receiveMessage", chatGPTMsg);
          }
        }
      } catch (error) {
        console.error("Error processing ChatGPT request:", error);
      }
    }
  });

  socket.on("disconnect", () => {
    for (const id in onlineUsers) {
      const user = onlineUsers[id];
      if (user && user.socketId === socket.id) {
        delete onlineUsers[id];
      }
    }
    emitOnlineUsers();
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
