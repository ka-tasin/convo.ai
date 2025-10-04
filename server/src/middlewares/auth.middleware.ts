import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

interface DecodedToken extends JwtPayload {
  id: string;
  username: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Invalid token format: Token value is missing" });
  }

  if (!secret) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }

  try {
    // ✅ Step 1: cast to unknown first to avoid type conflict
    const decoded = jwt.verify(token, secret) as unknown as DecodedToken;

    // ✅ Step 2: ensure required fields exist
    if (!decoded.id || !decoded.username) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    // ✅ Step 3: assign to request
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
