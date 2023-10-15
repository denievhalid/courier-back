import { model, Schema } from "mongoose";

const schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Ad", schema);
