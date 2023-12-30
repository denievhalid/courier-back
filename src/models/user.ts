import { model, Schema } from "mongoose";
import { Gender, Models } from "@/types";

const schema = new Schema({
  avatar: {
    uri: String,
  },
  active: {
    type: Boolean,
    default: true,
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
  city: {
    type: String,
    required: true,
  },
  notificationTokens: {
    type: Array,
  },
});

export default model(Models.USER, schema);
