import { model, Schema } from "mongoose";
import { DeliveryStatus } from "@/types";

const schema = new Schema(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        DeliveryStatus.PENDING,
        DeliveryStatus.REJECTED,
        DeliveryStatus.APPROVED,
      ],
      default: DeliveryStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Delivery", schema);
