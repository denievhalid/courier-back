import dotenv from "dotenv";

dotenv.config();

export const getEnv = (key: string) => {
  return process.env[key.toUpperCase()] ?? ``;
};
