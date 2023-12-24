import { model, Schema } from "mongoose";
import { MessageStatus, SystemActionCodes } from "@/types";

const schema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    replayedMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [MessageStatus.PENDING, MessageStatus.READ, MessageStatus.SEND],
      required: true,
      default: MessageStatus.SEND,
    },
    systemAction: {
      type: String,
      enum: [
        SystemActionCodes.DELIVERY_REQUESTED,
        SystemActionCodes.DELIVERY_CANCELED,
        SystemActionCodes.DELIVERY_CONFIRMED,
        SystemActionCodes.DELIVERY_EXPIRED,
      ],
    },
    type: {
      type: Number,
      enum: [0, 1, 2, 4],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", schema);
