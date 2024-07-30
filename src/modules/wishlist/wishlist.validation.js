import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const addToWishList = {
  params: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};


