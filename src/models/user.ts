import { model, Schema } from "mongoose";
import { Gender } from "@/types";

const schema = new Schema({
  avatar: {
    uri: String,
  },
  gender: {
    type: String,
    enum: [Gender.MALE, Gender.FEMALE],
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    trim: true,
    required: true,
  },
});

export default model("User", schema);
