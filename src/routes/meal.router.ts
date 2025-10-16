import express from "express";
import { createMeal } from "../controller/meal.controller";

const mealRouter = express.Router();

mealRouter.post("/create", createMeal);

export default mealRouter;
