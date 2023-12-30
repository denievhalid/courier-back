import { model, Schema } from "mongoose";
import { Models } from "@/types";

const schema = new Schema(
  {
    uri: {
      type: String,
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

export default model(Models.FILE, schema);
