import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    message: {
      type: Schema,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "read"],
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", schema);
