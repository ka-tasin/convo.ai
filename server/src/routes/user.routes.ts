import express from "express";
import { getUsers, getUserStatus } from "../contorllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id/status", authenticateToken, getUserStatus);

export default router;
