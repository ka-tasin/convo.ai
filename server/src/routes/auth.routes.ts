import express from "express";
import { register, login, getMe } from "../contorllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
