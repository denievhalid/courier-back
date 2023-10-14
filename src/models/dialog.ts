import { model, Schema } from "mongoose";

const schema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

export default model("Dialog", schema);
