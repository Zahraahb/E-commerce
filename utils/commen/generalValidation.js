import { Types } from "mongoose";

export const objectIdValidation = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("invalid object id");
};
