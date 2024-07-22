import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createBrand = {
    body:joi.object({
        name:joi.string().min(3).max(30).required(),
        
    }).required(),
    file:generalFieldes.file.required(),
    headers:generalFieldes.headers.required(),
}

export const updateBrand = {
  body: joi.object({
    name: joi.string().min(3).max(30),
  }),
  file: generalFieldes.file,
  headers: generalFieldes.headers.required(),
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};

export const specificBrand = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};

export const deleteBrand = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};