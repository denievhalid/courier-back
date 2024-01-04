import mongoose from "mongoose";
import { getEnv } from "@/utils/env";

export const initDatabase = async () => {
  return mongoose.connect(getEnv("MONGOOSE_URI_WITH_REPLICA"));
};

export const startTransaction = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
};

export const abortTransaction = async (session: mongoose.ClientSession) => {
  return session.abortTransaction();
};
