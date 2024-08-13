import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    products: [
      {
        title: { type: String, required: true },
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    subPrice: { type: Number, required: true },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "coupon",
    },

    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "placed",
        "pending",
        "waitPayment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "placed",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "cash"],
    },
    phone:{ type: Number, required: true},
    address: { type: String, required: true },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "user"},
    reason: { type: String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const orderModel = model("order", orderSchema);
export default orderModel;
