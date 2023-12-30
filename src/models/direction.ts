import { model, Schema } from "mongoose";
import { Models } from "@/types";

const schema = new Schema({
  hash: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ads: {
    type: Array<string>,
    required: true,
  },
  filter: {
    type: String,
    required: true,
  },
});

export default model(Models.DIRECTION, schema);
