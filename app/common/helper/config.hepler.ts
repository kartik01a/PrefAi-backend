export const loadConfig = () => {
  const env = process.env.NODE_ENV || "production"; // default to production in EB
  const filepath = path.join(process.cwd(), `.env.${env}`);

  if (env !== "production" && fs.existsSync(filepath)) {
    dotenv.config({ path: filepath, override: false });
    console.log(`Loaded environment from ${filepath}`);
  } else {
    console.log(`Using system/EB environment variables`);
  }
};
