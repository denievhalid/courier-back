import { model, Schema } from "mongoose";
import { Models } from "@/types";

const schema = new Schema(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: Models.AD,
      required: true,
    },
    adAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courier: {
      type: Schema.Types.ObjectId,
      ref: Models.USER,
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastRequestedDeliveryMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    deleted: [
      {
        forUser: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        toMessage: {
          type: Schema.Types.ObjectId,
          ref: "Message",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model(Models.CONVERSATION, schema);
