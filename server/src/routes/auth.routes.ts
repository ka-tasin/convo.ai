// import express from "express";
// import User from "../models/user.model";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const authRouter = express.Router();

// authRouter.post("/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email }, { username }],
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         message:
//           existingUser.email === email
//             ? "Email already exists"
//             : "Username already taken",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: "User registered", user });
//   } catch (err: any) {
//     console.error("Error during register:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// });

// authRouter.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("hit login");
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });
//     console.log(email, password, user);
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     if (!process.env.JWT_SECRET) {
//       console.error("❌ Missing JWT_SECRET in .env");
//       return res.status(500).json({ error: "Server misconfiguration" });
//     }

//     const token = jwt.sign(
//       { id: user._id, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ token, user: { username: user.username, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default authRouter;
import express from "express";
import { register, login, getMe } from "../contorllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
