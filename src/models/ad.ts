import { model, Schema } from "mongoose";
import { AdStatus } from "@/types";

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
  images: [
    {
      uri: String,
    },
  ],
  from: {
    city_name: {
      type: String,
      required: true,
      trim: true,
    },
    city_kladr: {
      type: String,
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
      trim: true,
    },
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: [AdStatus.APPROVED, AdStatus.PENDING, AdStatus.REJECTED],
    default: AdStatus.PENDING,
  },
});

export default model("Ad", schema);
