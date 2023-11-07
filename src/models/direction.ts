import { model, Schema } from "mongoose";

const schema = new Schema({
  hash: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Direction", schema);
