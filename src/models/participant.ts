import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    courier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Participant", schema);
