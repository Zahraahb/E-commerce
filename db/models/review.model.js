import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rate: {
      type: Number,
      required: [true, "rate is required"],
      min: 1,
      max: 5,
    },
    productId:{
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const reviewModel = model("review", reviewSchema);
export default reviewModel;
