import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";

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
}
// In-memory storage for demo
const conversations: Record<string, Message[]> = {};

const getConversationKey = (id1: string, id2: string) =>
  [id1, id2].sort().join("_");

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

  socket.on("sendMessage", (msg: Message) => {
    // Save message
    const key = getConversationKey(msg.senderId, msg.receiverId);
    if (!conversations[key]) conversations[key] = [];
    conversations[key].push(msg);

    // Emit to receiver
    const receiver = onlineUsers[msg.receiverId];
    if (receiver) io.to(receiver.socketId).emit("receiveMessage", msg);

    // Emit back to sender
    socket.emit("receiveMessage", msg);
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
