import mongoose from "mongoose";
import { getEnv } from "@/utils/env";

export const initDatabase = async () => {
  return mongoose.connect(getEnv("MONGOOSE_URI_WITH_REPLICA"));
};
