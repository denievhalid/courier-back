import { model, Schema } from "mongoose";

const schema = new Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
});

export default model("User", schema);
