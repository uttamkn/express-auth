const validateEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    console.error(`Environment variable ${key} not found`);
    throw new Error(`Environment variable ${key} not found`);
  }
  return value;
};

export const JWT_SECRET = validateEnv("JWT_SECRET", process.env.JWT_SECRET);
export const PORT = validateEnv("PORT", process.env.PORT);
export const MONGO_URI = validateEnv("MONGO_URI", process.env.MONGO_URI);
export const CLIENT_URL = validateEnv("CLIENT_URL", process.env.CLIENT_URL);
export const GMAIL_USER = validateEnv("GMAIL_USER", process.env.GMAIL_USER);
export const GMAIL_PASSWORD = validateEnv(
  "GMAIL_PASSWORD",
  process.env.GMAIL_PASSWORD
);
