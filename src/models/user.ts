import { model, Schema } from "mongoose";

const schema = new Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
});

export default model("User", schema);
