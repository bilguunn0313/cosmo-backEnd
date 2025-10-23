import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import {
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from "./middleware/errorHandler";
import odooRouter from "./routes/odooAuth.router";
import { getRedisConfig } from "./config/redis.config";

handleUnhandledRejection();
handleUncaughtException();

const app: Application = express();

// INITIALIZE REDIS
// const initializeRedis = async () => {
//   try {
//     const redisConfig = getRedisConfig();
//     await redisConfig.getClient();
//     console.log("✅ Redis initialized");
//   } catch (error) {
//     console.error("❌ Redis initialization failed:", error);
//     console.warn("⚠️ Server will continue without Redis");
//     // Don't crash the server if Redis is unavailable
//   }
// };
// initializeRedis();

// Security headers
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
    next();
  });
}

// Health check
app.get("/health", async (req: Request, res: Response) => {
  const redisConfig = getRedisConfig();
  const redisHealthy = await redisConfig.ping();

  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    services: {
      redis: redisHealthy ? "healthy" : "unavailable",
    },
  });
});

// API routes
app.use("/api", odooRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// ERROR HANDLER (Must be last)
// ==========================================
app.use(errorHandler);

const gracefulShutdown = async () => {
  console.log("\n⚠️ Shutting down gracefully...");

  try {
    const redisConfig = getRedisConfig();
    await redisConfig.disconnect();
    console.log("✅ Redis disconnected");
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
  }

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
