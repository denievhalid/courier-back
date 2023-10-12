import { model, Schema } from "mongoose";

const schema = new Schema({
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    trim: true,
  },
});

export default model("User", schema);
