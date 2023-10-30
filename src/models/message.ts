import { model, Schema } from "mongoose";
import { MessageStatus } from "@/types";

const schema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
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
      default: MessageStatus.SEND,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", schema);
