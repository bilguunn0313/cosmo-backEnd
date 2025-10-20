import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";

// 🧑‍🍳 Create a meal (only Chef or Admin)
export const createMeal = async (req: Request, res: Response) => {
  try {
    const { foodName, ingredients, imageUrl } = req.body;

    if (!foodName) {
      return res.status(400).json({ error: "Food name is required" });
    }

    const meal = await prisma.meal.create({
      data: {
        foodName,
        ingredients,
        imageUrl,
      },
    });

    res.status(201).json(meal);
  } catch (error) {
    console.error("Create meal error:", error);
    res.status(500).json({ error: "Failed to create meal" });
  }
};
