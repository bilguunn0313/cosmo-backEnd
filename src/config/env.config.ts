import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

// Check if .env file was loaded
if (result.error) {
  console.error("❌ Failed to load .env file");
  console.error("   Looking for file at:", envPath);
  console.error("   Error:", result.error.message);
  console.error("\n💡 Make sure .env file exists in project root");
  process.exit(1);
}

console.log("✅ Environment variables loaded successfully");

// Define required environment variables
const requiredEnvVars = [
  "ERP_URL",
  "ERP_DB",
  "ERP_USER",
  "ERP_PASSWORD",
  "JWT_SECRET",
] as const;

// Validate all required variables exist
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("\n❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  console.error("\n💡 Add these to your .env file in the project root\n");
  process.exit(1);
}

// Log loaded configuration (hide sensitive data)
console.log("📋 Configuration loaded:");

// Export validated configuration
export const config = {
  erp: {
    url: process.env.ERP_URL!,
    db: process.env.ERP_DB!,
    user: process.env.ERP_USER!,
    password: process.env.ERP_PASSWORD!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: "7d",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "*",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
};

// Type-safe config
export type Config = typeof config;
