// import { Request, Response, NextFunction } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";

// export interface AuthRequest extends Request {
//   user?: { id: string; username: string };
// }

// interface DecodedToken extends JwtPayload {
//   id: string;
//   username: string;
// }

// export const protect = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   const secret = process.env.JWT_SECRET;

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Invalid token format: Token value is missing" });
//   }

//   if (!secret) {
//     return res.status(500).json({ message: "JWT secret not configured" });
//   }

//   try {
//     const decoded = jwt.verify(token, secret) as unknown as DecodedToken;

//     if (!decoded.id || !decoded.username) {
//       return res.status(401).json({ message: "Invalid token structure" });
//     }

//     req.user = { id: decoded.id, username: decoded.username };
//     next();
//   } catch (err) {
//     console.error("JWT verification failed:", err);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
