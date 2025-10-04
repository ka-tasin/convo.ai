import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const users: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (username: string) => {
    users[socket.id] = username;
    console.log(`Registered ${username} with socket ${socket.id}`);
  });

  socket.on("sendMessage", (data) => {
    console.log(`Message from ${data.sender}: ${data.content}`);
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
