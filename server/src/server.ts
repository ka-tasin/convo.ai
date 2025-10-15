import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./socket/socket.handlers";
import { aiService } from "./services/ai.service";
import app from "./app";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${aiService.getMode()}`);
  console.log(
    `💡 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`
  );
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
