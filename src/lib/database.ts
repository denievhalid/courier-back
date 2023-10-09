import mongoose from "mongoose";
import { getEnv } from "@/utils/env";

export const initDatabase = async () => {
  return mongoose.connect(getEnv("mongoose_uri"));
};
