import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const addReview = {
  body: joi.object({
    comment: joi.string().min(3).required(),
    rate: joi.number().min(1).max(5).integer().required(),
  }),
  params: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};

export const getReviews = {
  params: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
  }),
};
