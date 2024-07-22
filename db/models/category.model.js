import { Schema, model } from "mongoose";


const categorySchema = new Schema(
  {
    name: {
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
    slug: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      unique: true,
      trim: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    customId:String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const categoryModel = model("category", categorySchema);
export default categoryModel;
