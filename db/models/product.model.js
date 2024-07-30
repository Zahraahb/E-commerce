import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
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
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "brand",
      required: true,
    },
    slug: {
      type: String,
      minLength: 3,
      maxLength: 60,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      minLength: 3,
      trim: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    coverImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    discount: {
      type: Number,
      min: 1,
      max: 100,
    },
    subPrice: {
      type: Number,
      min: 1,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    rateAvg: {
      type: Number,
      min: 0,
      max: 5,
    },
    rateNum: {
      type: Number,
      default:0,
    },
    customId: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const productModel = model("product", productSchema);
export default productModel;
