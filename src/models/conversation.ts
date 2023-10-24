import { model, Schema } from "mongoose";

const schema = new Schema({
  ad: {
    type: Schema.Types.ObjectId,
    ref: "Ad",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Conversation", schema);
