import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/api/ai-status", (req, res) => {
  const { aiService } = require("./services/ai.service");
  res.json({
    mode: aiService.getMode(),
    portfolioMode: process.env.PORTFOLIO_MODE,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openAIKeyValid: process.env.OPENAI_API_KEY?.startsWith("sk-"),
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    mode: process.env.PORTFOLIO_MODE === "true" ? "PORTFOLIO" : "LIVE",
    database: "Connected",
    timestamp: new Date().toISOString(),
  });
});

export default app;
