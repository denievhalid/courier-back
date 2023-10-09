import { model, Schema } from "mongoose";

const schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Ad", schema);
