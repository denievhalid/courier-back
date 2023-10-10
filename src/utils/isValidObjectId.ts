import mongoose from "mongoose";

export const isValidObjectId = (value: string) => {
  return mongoose.isValidObjectId(value);
};
