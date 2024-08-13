import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createCoupon = {
  body: joi
    .object({
      code: joi.string().min(3).max(30).required(),
      amount:joi.number().min(1).max(100).integer().required(),
      fromDate: joi.date().greater(Date.now()).required(),
      toDate:joi.date().greater(joi.ref("fromDate")).required(),
    }),
    
  headers: generalFieldes.headers.required(),
};

export const updateCoupon = {
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


export const deleteCoupon = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};