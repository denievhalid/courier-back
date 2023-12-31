import { model, Schema } from "mongoose";
import { Models } from "@/types";

const schema = new Schema(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model(Models.FAVORITE, schema);
