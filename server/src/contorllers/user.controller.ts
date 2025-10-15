import { Response } from "express";
import { AuthRequest } from "../types";
import { userService } from "../services/user.service";

export const getUsers = (req: AuthRequest, res: Response) => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

export const getUserStatus = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const status = userService.getUserStatus(userId);
    res.json(status);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching user status" });
  }
};
