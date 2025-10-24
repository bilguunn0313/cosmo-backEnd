import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getActiveUsers,
  getAllUsers,
  getCurrentUser,
  getUserByEmail,
  getUserById,
} from "../controller/users/getUser.controller";
import { login } from "../controller/users/auth.controller";
import { verifyToken } from "../controller/users/odooAuth.controller";
import {
  loginRateLimit,
  standardRateLimit,
} from "../middleware/rateLimit.middleware";

const odooRouter = Router();

odooRouter.post("/auth/login", loginRateLimit, login);
odooRouter.post("/auth/verify", verifyToken);
odooRouter.get("/users", authenticateToken, standardRateLimit, getAllUsers);
odooRouter.get(
  "/users/active",
  authenticateToken,
  standardRateLimit,
  getActiveUsers
);
odooRouter.get(
  "/users/me",
  authenticateToken,
  standardRateLimit,
  getCurrentUser
);
odooRouter.get("/users/:id", authenticateToken, standardRateLimit, getUserById);
odooRouter.get("/user", authenticateToken, standardRateLimit, getUserByEmail);

export default odooRouter;
