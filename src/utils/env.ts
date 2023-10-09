import dotenv from "dotenv";

dotenv.config();

export const getEnv = (key: string) => {
  console.log();
  return process.env[key.toUpperCase()] ?? ``;
};
