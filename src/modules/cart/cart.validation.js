import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createCart = {
  body: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
    quantity: joi.number().integer().required(),
  
  }),

  headers: generalFieldes.headers.required(),
};

export const updateCart = {
  body: joi.object({
    code: joi.string().min(3).max(30),
    amount: joi.number().min(1).max(100).integer(),
    fromDate: joi.date().greater(Date.now()),
    toDate: joi.date().greater(joi.ref("fromDate")),
  }),
  headers: generalFieldes.headers.required(),
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};

export const specificCoupon = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),

};

export const deleteProductCart = {
  body: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};

export const clearCart = {
  headers: generalFieldes.headers.required(),
};