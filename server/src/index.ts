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

// 🎯 PORTFOLIO MODE - Always works without API keys
const PORTFOLIO_MODE = process.env.PORTFOLIO_MODE !== "false"; // Default true for portfolio
let openai: OpenAI | null = null;
let useOpenAI = false;

// Only initialize OpenAI if explicitly disabled portfolio mode AND API key exists
if (
  !PORTFOLIO_MODE &&
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY.startsWith("sk-")
) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    useOpenAI = true;
    console.log("🚀 OpenAI initialized - LIVE MODE");
  } catch (error) {
    console.log("❌ OpenAI failed, falling back to PORTFOLIO MODE");
    useOpenAI = false;
  }
}

// ------------------ User Management ------------------
interface OnlineUser {
  socketId: string;
  username: string;
}

interface StoredUser {
  username: string;
  lastSeen?: number;
}

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: number | undefined;
}

const onlineUsers: Record<string, OnlineUser> = {};
const allUsers: Record<string, StoredUser> = {};

const emitOnlineUsers = () => {
  const users = Object.entries(onlineUsers).map(([id, data]) => ({
    id,
    username: data.username,
  }));
  io.emit("onlineUsers", users);
};

const emitAllUsers = () => {
  const usersList: User[] = Object.entries(allUsers).map(([id, data]) => ({
    id,
    username: data.username,
    isOnline: !!onlineUsers[id],
    lastSeen: data.lastSeen,
  }));
  io.emit("allUsers", usersList);
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

// ------------------ Enhanced Portfolio Mock AI ------------------
function getPortfolioAIResponse(question: string): string {
  const lowerQuestion = question.toLowerCase().trim();

  // Enhanced response database for portfolio
  const portfolioResponses: Record<string, string> = {
    // Greetings
    hello:
      "👋 Hello! I'm the AI assistant in this portfolio project. I can demonstrate real-time AI chat integration!",
    hi: "😊 Hi there! This demo shows AI messaging between users - perfect for testing the app.",
    hey: "👋 Hey! Welcome to the chat demo. Try asking me various questions to see the AI in action!",

    // About the AI
    "how are you":
      "🎯 I'm running in portfolio mode! This demonstrates AI integration without API dependencies.",
    "who are you":
      "🤖 I'm a demo AI assistant showcasing real-time chat features. In production, I'd use OpenAI GPT!",
    "what are you":
      "🚀 I'm part of a portfolio project demonstrating: real-time messaging, user auth, and AI integration!",
    "what can you do":
      "💡 I can: Answer questions, chat with multiple users, demonstrate real-time features - all in this portfolio demo!",

    // Project info
    portfolio:
      "📁 This is a portfolio project featuring: React + TypeScript + Socket.io + Node.js + AI integration!",
    demo: "🎮 You're experiencing the demo! Real AI would be enabled in production with an OpenAI API key.",
    project:
      "💼 This chat app demonstrates full-stack skills: real-time messaging, authentication, and scalable architecture.",

    // Technical questions
    "how does this work":
      "🔧 Tech stack: React frontend, Node.js/Express backend, Socket.io for real-time messaging, JWT auth!",
    "what technology":
      "⚙️ Built with: React, TypeScript, Node.js, Express, Socket.io, MongoDB, JWT, and AI integration!",
    "source code":
      "📚 This project showcases clean, maintainable code structure and production-ready patterns.",

    // Fun facts
    "who is obama":
      "🇺🇸 Barack Obama was the 44th US President (2009-2017). This demo shows AI knowledge responses!",
    "where is tajmahal":
      "🏛️ Taj Mahal is in Agra, India - a beautiful marble mausoleum! Demo AI can answer geography questions.",
    "tell me a joke":
      "😄 Why do programmers prefer dark mode? Because light attracts bugs! This shows AI humor integration.",
    "capital of france":
      "🗼 Paris is the capital of France! The AI can handle geography and trivia questions.",
    weather:
      "🌤️ I'm in demo mode, but this could integrate with weather APIs in production!",

    // Help
    help: "❓ Try asking about: people, places, tech, jokes, or how this app works! Great for demo purposes.",
    commands:
      "💬 Use @ai, @chatgpt, or end with ? to talk to me. Perfect for testing the AI features!",

    // Time
    time: `⏰ Current time: ${new Date().toLocaleTimeString()}. Demo shows real-time messaging capabilities!`,
    date: `📅 Today is ${new Date().toLocaleDateString()}. The app handles real-time data efficiently.`,

    // Features
    features:
      "⭐ Features: Real-time chat, online users, AI integration, JWT auth, responsive design!",
    "real time":
      "⚡ Yes! This uses Socket.io for instant messaging between users - no page refresh needed!",

    // Offline messaging
    "offline message":
      "💤 You can message offline users! They'll see your messages when they come back online.",
    "message offline":
      "📨 Messages to offline users are stored and delivered when they reconnect. Perfect for async communication!",
  };

  // Exact matches first
  for (const [key, response] of Object.entries(portfolioResponses)) {
    if (lowerQuestion === key) {
      return response;
    }
  }

  // Partial matches
  for (const [key, response] of Object.entries(portfolioResponses)) {
    if (lowerQuestion.includes(key)) {
      return response;
    }
  }

  // Smart responses for common patterns
  if (lowerQuestion.includes("how do") || lowerQuestion.includes("how to")) {
    return "🔍 That's a great \"how-to\" question! In production, I'd provide step-by-step guidance using AI intelligence.";
  }

  if (lowerQuestion.includes("what is") || lowerQuestion.includes("what are")) {
    const topic = lowerQuestion.replace(/what (is|are)/, "").trim();
    return `📚 About "${topic}" - I can explain concepts in demo mode! Production AI would give detailed explanations.`;
  }

  if (lowerQuestion.includes("who is") || lowerQuestion.includes("who are")) {
    const person = lowerQuestion.replace(/who (is|are)/, "").trim();
    return `👤 "${person}" - Demo AI can identify people! Real AI would provide comprehensive biographies.`;
  }

  if (lowerQuestion.includes("where is")) {
    const place = lowerQuestion.replace("where is", "").trim();
    return `🗺️ "${place}" - I can locate places in demo mode! Production would use geolocation APIs.`;
  }

  if (lowerQuestion.endsWith("?")) {
    return "❓ Great question! This demonstrates the AI's ability to handle inquiries in a chat environment.";
  }

  // Default portfolio responses
  const defaultResponses = [
    "🎯 Thanks for testing this portfolio project! I'm demonstrating AI chat integration.",
    "🚀 This demo shows real-time messaging with AI capabilities - perfect for showcasing full-stack skills!",
    "💼 In a production environment, this would use OpenAI GPT for intelligent responses.",
    "👨‍💻 This portfolio project demonstrates: real-time features, clean architecture, and AI integration patterns.",
    "🔧 Nice question! This showcases the AI response system in a full-stack application.",
    "⭐ You're experiencing the demo version! The real AI would provide more nuanced answers.",
  ];

  return (
    defaultResponses[Math.floor(Math.random() * defaultResponses.length)] ??
    "🎯 Thanks for testing this portfolio project! I'm demonstrating AI chat integration."
  );
}

// ------------------ OpenAI Function (Optional) ------------------
async function getOpenAIResponse(
  question: string,
  conversationKey: string,
  userName: string,
  otherUserName: string
): Promise<string> {
  if (!openai) {
    return getPortfolioAIResponse(question);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant in a chat between ${userName} and ${otherUserName}. Be brief and friendly.`,
        },
        {
          role: "user",
          content: `${userName}: ${question}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      getPortfolioAIResponse(question)
    );
  } catch (error) {
    console.error("OpenAI failed, using portfolio AI:", error);
    return getPortfolioAIResponse(question);
  }
}

// ------------------ Socket.IO Handlers ------------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Get all users (for new connections)
  socket.on("getAllUsers", () => {
    emitAllUsers();
  });

  socket.on("registerUser", (token: string) => {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      // Store user in allUsers if not exists
      if (!allUsers[decoded.id]) {
        allUsers[decoded.id] = {
          username: decoded.username,
          lastSeen: Date.now(),
        };
      } else {
        // Update existing user
        allUsers[decoded.id].username = decoded.username;
        allUsers[decoded.id].lastSeen = Date.now();
      }

      // Update online users
      onlineUsers[decoded.id] = {
        socketId: socket.id,
        username: decoded.username,
      };

      console.log(`User ${decoded.username} (${decoded.id}) came online`);

      // Emit updated user lists
      emitOnlineUsers();
      emitAllUsers();

      // Check for pending messages for this user
      const pendingMessages: Message[] = [];
      Object.entries(conversations).forEach(([key, msgs]) => {
        if (key.includes(decoded.id)) {
          // Find messages sent to this user while they were offline
          const userMessages = msgs.filter(
            (msg) =>
              msg.receiverId === decoded.id &&
              !msg.isChatGPT &&
              msg.timestamp > (allUsers[decoded.id]?.lastSeen || 0)
          );
          pendingMessages.push(...userMessages);
        }
      });

      // Send any pending messages
      if (pendingMessages.length > 0) {
        console.log(
          `Delivering ${pendingMessages.length} pending messages to ${decoded.username}`
        );
        pendingMessages.forEach((msg) => {
          socket.emit("receiveMessage", msg);
        });
      }
    } catch (err) {
      console.log("Invalid token during registration");
    }
  });

  socket.on("loadConversation", ({ userId, otherId }) => {
    const key = getConversationKey(userId, otherId);
    socket.emit("conversationLoaded", conversations[key] || []);
  });

  socket.on("sendMessage", async (msg: Message) => {
    // Save message to conversation
    const key = getConversationKey(msg.senderId, msg.receiverId);
    if (!conversations[key]) conversations[key] = [];
    conversations[key].push(msg);

    // Check if receiver is online
    const receiver = onlineUsers[msg.receiverId];

    if (receiver) {
      // Receiver is online - deliver immediately
      io.to(receiver.socketId).emit("receiveMessage", msg);
      console.log(`Message delivered immediately to ${receiver.username}`);
    } else {
      // Receiver is offline - store message for later delivery
      console.log(`Message stored for offline user ${msg.receiverId}`);

      // Update last seen for receiver
      if (allUsers[msg.receiverId] !== undefined) {
        allUsers[msg.receiverId]!.lastSeen = Date.now();
      }
    }

    // Always emit back to sender for UI update
    socket.emit("receiveMessage", msg);

    // Check if message is asking AI
    const isAskingAI =
      msg.content.toLowerCase().startsWith("@chatgpt") ||
      msg.content.toLowerCase().startsWith("@ai") ||
      msg.content.toLowerCase().startsWith("@gpt") ||
      msg.content.toLowerCase().startsWith("@assistant") ||
      msg.content.trim().endsWith("?");

    if (isAskingAI) {
      // Small delay to feel natural
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        const senderUser = onlineUsers[msg.senderId];
        const receiverUser = onlineUsers[msg.receiverId];

        if (senderUser) {
          // Remove the trigger prefixes
          let question = msg.content;
          const prefixes = ["@chatgpt", "@ai", "@gpt", "@assistant"];

          for (const prefix of prefixes) {
            if (question.toLowerCase().startsWith(prefix)) {
              question = question.substring(prefix.length).trim();
              break;
            }
          }

          let aiResponse: string;

          if (useOpenAI) {
            aiResponse = await getOpenAIResponse(
              question,
              key,
              senderUser.username,
              receiverUser?.username || "User"
            );
          } else {
            aiResponse = getPortfolioAIResponse(question);
          }

          // Create AI message
          const aiMsg: Message = {
            senderId: "ai",
            senderName: "AI Assistant",
            receiverId: msg.receiverId,
            content: aiResponse,
            timestamp: Date.now(),
            isChatGPT: true,
          };

          // Save AI response to conversation
          conversations[key].push(aiMsg);

          // Send AI response to sender
          socket.emit("receiveMessage", aiMsg);

          // Send AI response to receiver if online
          if (receiver) {
            io.to(receiver.socketId).emit("receiveMessage", aiMsg);
          }
        }
      } catch (error) {
        console.error("Error in AI processing:", error);

        // Fallback to portfolio response
        const fallbackMsg: Message = {
          senderId: "ai",
          senderName: "AI Assistant",
          receiverId: msg.receiverId,
          content: getPortfolioAIResponse(msg.content),
          timestamp: Date.now(),
          isChatGPT: true,
        };

        socket.emit("receiveMessage", fallbackMsg);
        if (receiver) {
          io.to(receiver.socketId).emit("receiveMessage", fallbackMsg);
        }
      }
    }
  });

  // User typing indicators
  socket.on("typingStart", ({ userId, receiverId }) => {
    const receiver = onlineUsers[receiverId];
    if (receiver) {
      io.to(receiver.socketId).emit("userTyping", { userId, isTyping: true });
    }
  });

  socket.on("typingStop", ({ userId, receiverId }) => {
    const receiver = onlineUsers[receiverId];
    if (receiver) {
      io.to(receiver.socketId).emit("userTyping", { userId, isTyping: false });
    }
  });

  // Get user status
  socket.on("getUserStatus", (userId: string) => {
    const isOnline = !!onlineUsers[userId];
    const userData = allUsers[userId];
    socket.emit("userStatus", {
      userId,
      isOnline,
      lastSeen: userData?.lastSeen,
    });
  });

  socket.on("disconnect", () => {
    let disconnectedUserId: string | null = null;
    let disconnectedUsername: string | null = null;

    // Find and remove from online users
    for (const id in onlineUsers) {
      const user = onlineUsers[id];
      if (user && user.socketId === socket.id) {
        disconnectedUserId = id;
        disconnectedUsername = user.username;
        delete onlineUsers[id];
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(
        `User ${disconnectedUsername} (${disconnectedUserId}) went offline`
      );

      // Update last seen
      if (disconnectedUserId && allUsers[disconnectedUserId]) {
        allUsers[disconnectedUserId]!.lastSeen = Date.now();
      }

      // Emit updated lists
      emitOnlineUsers();
      emitAllUsers();
    }

    console.log("Client disconnected:", socket.id);
  });
});

// API route to get all users (optional REST endpoint)
app.get("/api/users", (req, res) => {
  const usersList: User[] = Object.entries(allUsers).map(([id, data]) => ({
    id,
    username: data.username,
    isOnline: !!onlineUsers[id],
    lastSeen: data.lastSeen,
  }));
  res.json(usersList);
});

// API route to get user status
app.get("/api/users/:id/status", (req, res) => {
  const userId = req.params.id;
  const isOnline = !!onlineUsers[userId];
  const userData = allUsers[userId];

  res.json({
    userId,
    isOnline,
    lastSeen: userData?.lastSeen,
    username: userData?.username,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    onlineUsers: Object.keys(onlineUsers).length,
    totalUsers: Object.keys(allUsers).length,
    mode: useOpenAI ? "LIVE (OpenAI)" : "PORTFOLIO (Demo AI)",
    timestamp: new Date().toISOString(),
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  console.log(`📊 Storage: ${Object.keys(allUsers).length} total users`);

  if (useOpenAI) {
    console.log("🎯 LIVE MODE - OpenAI GPT enabled");
    console.log(
      "💡 To switch to portfolio mode: set PORTFOLIO_MODE=true in .env"
    );
  } else {
    console.log("🎯 PORTFOLIO MODE - Demo AI enabled (always works)");
    console.log("👥 All Users Feature: Message anyone, online or offline");
    console.log(
      "💡 Test commands: @ai hello, @ai portfolio, @ai how does this work"
    );
    console.log(
      "💡 To enable real AI: set PORTFOLIO_MODE=false and add OPENAI_API_KEY"
    );
  }
});
