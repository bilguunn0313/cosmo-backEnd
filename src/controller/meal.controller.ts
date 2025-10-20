// import { Request, Response } from "express";
// import Odoo from "odoo-await";

// const odoo = new Odoo({
//   baseUrl: process.env.ERP_URL!,
//   db: process.env.ERP_DB!,
//   username: process.env.ERP_USER!,
//   password: process.env.ERP_PASSWORD!,
// });

// export const createMeal = async (req: Request, res: Response) => {
//   const { name, ingredients } = req.body;
//   try {
//     await odoo.connect();

//     const id = await odoo.create("meal.menu", {
//       name,
//       ingredients,
//     });

//     return res.status(201).json({ id, message: "Meal created in ERP" });
//   } catch (err: any) {
//     console.error("ERP create meal error:", err);
//     return res.status(500).json({ message: "Failed to create meal" });
//   }
// };

// export const getMeals = async (req: Request, res: Response) => {
//   try {
//     await odoo.connect();
//     const meals = await odoo.searchRead(
//       "meal.menu",
//       [],
//       ["id", "name", "ingredients"]
//     );
//     return res.json(meals);
//   } catch (err: any) {
//     console.error("ERP get meals error:", err);
//     return res.status(500).json({ message: "Failed to fetch meals" });
//   }
// };
