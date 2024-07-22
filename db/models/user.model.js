import { Schema, model } from "mongoose";
import { systemRoles } from "../../utils/commen/enum.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      maxLength: 15,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      // match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
      min: 18,
    },
    phone: [String],
    address: [String],
    confirmed: {
      type: Boolean,
      default: false,
    },
    loggedIn: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(systemRoles),
      default: systemRoles.USER,
    },
    OTP: {
      type: Number,
      default: null,
    },
    OTPExpierTime: {
      type: Date,
      default: null,
    },
    passwordChangeAt:Date
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const userModel = model("user", userSchema);
export default userModel;