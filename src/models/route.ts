import { model, Schema } from "mongoose";

const schema = new Schema({
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
});

export default model("Route", schema);
