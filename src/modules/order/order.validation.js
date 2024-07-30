import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createOrder = {
  body: joi.object({
    productId: joi.string().custom(objectIdValidation),
    quantity: joi.number().integer(),
    phone: joi.string().required(),
    address: joi.string().required(),
    paymentMethod: joi.string().valid("cash","card").required(),
    couponCode: joi.string().min(3).max(30),
  }),

  headers: generalFieldes.headers.required(),
};

export const updateOrder = {
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



export const deleteProductOrder = {
  body: joi.object({
    productId: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};

export const cancelOrder = {
  params:joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};