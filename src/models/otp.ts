import { model, Schema } from "mongoose";
import { Models } from "@/types";

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
  phoneNumber: {
    type: Number,
    required: true,
    trim: true,
  },
});

export default model(Models.OTP, schema);
