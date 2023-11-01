import mongoose from "mongoose";

export const toObjectId = (value: string) => {
  return new mongoose.Types.ObjectId(value);
};
