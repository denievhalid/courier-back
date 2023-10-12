import { model, Schema } from "mongoose";

const schema = new Schema({
  deadline: {
    type: Date,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
    trim: true,
  },
  secret: {
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

export default model("Otp", schema);
