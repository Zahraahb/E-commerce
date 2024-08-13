import { Schema, model } from "mongoose";

const wishlistSchema = new Schema(
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
const wishlistModel = model( "wishList", wishlistSchema);
export default wishlistModel;
