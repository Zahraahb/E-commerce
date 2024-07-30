import { Schema, model } from "mongoose";

const wishListSchema = new Schema(
  {
   
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  
    products: [{
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const wishListModel = model( "wishList", wishListSchema);
export default wishListModel;
