import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

export const loadConfig = () => {
  const env = process.env.NODE_ENV || "development"; // Default to development for local

  // Always try to load .env first (base configuration)
  const baseEnvPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(baseEnvPath)) {
    dotenv.config({ path: baseEnvPath, override: false });
    console.log(`Loaded base environment from ${baseEnvPath}`);
  }

  // Then load environment-specific file
  const envSpecificPath = path.join(process.cwd(), `.env.${env}`);
  if (fs.existsSync(envSpecificPath)) {
    dotenv.config({ path: envSpecificPath, override: true }); // Override base with specific
    console.log(`Loaded environment-specific config from ${envSpecificPath}`);
  }

  // In production (EB), rely on system environment variables
  if (env === "production") {
    console.log(
      `Production mode: Using Elastic Beanstalk environment variables`
    );
  }

  // Log some info (without exposing sensitive data)
  console.log(`Environment: ${env}`);
  console.log(`PORT: ${process.env.PORT || "not set"}`);
};
