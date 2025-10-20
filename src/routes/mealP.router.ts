import express, { Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "@prisma/client";
import { createMeal } from "../controller/mealP/createMeal.controller";

const mealPouter = express.Router();

mealPouter.post(
  "/create",
  authenticate,
  authorize(Role.ADMIN, Role.CHEF),
  createMeal
);
export default mealPouter;
