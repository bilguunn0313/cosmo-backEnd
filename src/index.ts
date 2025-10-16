import express, { Request, Response } from "express";
import routes from "./routes";
import dotenv from "dotenv";
import cors from "cors";
import mealRouter from "./routes/meal.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", routes);
app.use("/meal", mealRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Express + TypeScript server running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
