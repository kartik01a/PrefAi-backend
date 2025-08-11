// import dotenv from "dotenv";
// import process from "process";
// import path from "path";

// export const loadConfig = () => {
//   const env = process.env.NODE_ENV ?? "local";
//   const filepath = path.join(process.cwd(), `.env.${env}`);
//   dotenv.config({ path: filepath });
// };


import dotenv from "dotenv";
import fs from "fs";
import process from "process";
import path from "path";

export const loadConfig = () => {
  const env = process.env.NODE_ENV ?? "local";
  const filepath = path.join(process.cwd(), `.env.${env}`);

  if (fs.existsSync(filepath)) {
    dotenv.config({ path: filepath });
    // small informative log (optional)
    // console.info(`Loaded env from ${filepath}`);
  } else {
    // In AWS/production you should set environment variables via the platform
    // This avoids accidentally loading local files in production.
    // console.info(`Env file ${filepath} not found — relying on process.env`);
  }
};
