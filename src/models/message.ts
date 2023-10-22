import { model, Schema } from "mongoose";
import { MessageStatus } from "@/types";

const schema = new Schema(
  {
    dialog: {
      type: Schema.Types.ObjectId,
      ref: "Dialog",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [MessageStatus.PENDING, MessageStatus.READ, MessageStatus.SEND],
      required: true,
      default: MessageStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", schema);
