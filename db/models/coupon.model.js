import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      maxLength: 30,
      lowercase: true,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: 1,
      max: 100,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const couponModel = model("coupon", couponSchema);
export default couponModel;
