import { model, Schema } from "mongoose";
import { AdStatus } from "@/types";

const schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  courier: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
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
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  rejectedReason: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      AdStatus.APPROVED,
      AdStatus.DRAFT,
      AdStatus.PENDING,
      AdStatus.REJECTED,
    ],
    default: AdStatus.DRAFT,
  },
});

export default model("Ad", schema);
