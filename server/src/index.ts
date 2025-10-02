import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import chatRoutes from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);

// Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
  });

  socket.on("send_message", (data) => {
    io.to(data.receiver).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// MongoDB connection & server start
const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MongoDB URI is not defined in environment variables");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
