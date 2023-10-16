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
  images: {
    type: Array,
    required: true,
  },
  from: {
    city_name: {
      type: String,
      required: true,
      trim: true,
    },
    city_kladr: {
      type: String,
      required: true,
      trim: true,
    },
  },
  to: {
    city_name: {
      type: String,
      required: true,
      trim: true,
    },
    city_kladr: {
      type: String,
      required: true,
      trim: true,
    },
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model("Ad", schema);
