import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
    },
    adAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Conversation", schema);
