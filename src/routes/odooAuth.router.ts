import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware";
import {
  getActiveUsers,
  getAllUsers,
  getCurrentUser,
  getUserByEmail,
  getUserById,
} from "../controller/users/getUser.controller";
import { login } from "../controller/auth.controller";
import { verifyToken } from "../controller/users/odooAuth.controller";

const odooRouter = Router();

odooRouter.post("/auth/login", login);
odooRouter.post("/auth/verify", verifyToken);
odooRouter.get("/users", authenticateToken, getAllUsers);
odooRouter.get("/users/active", authenticateToken, getActiveUsers);
odooRouter.get("/users/me", authenticateToken, getCurrentUser);
odooRouter.get("/users/:id", authenticateToken, getUserById);
odooRouter.get("/user", authenticateToken, getUserByEmail);

export default odooRouter;
