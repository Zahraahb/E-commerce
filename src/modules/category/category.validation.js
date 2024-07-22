import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createCategory = {
    body:joi.object({
        name:joi.string().min(3).max(30).required(),
        
    }).required(),
    file:generalFieldes.file.required(),
    headers:generalFieldes.headers.required(),
}

export const updateCategory = {
  body: joi
    .object({
      name: joi.string().min(3).max(30),
    }),
  file: generalFieldes.file,
  headers: generalFieldes.headers.required(),
};

export const specificCategory = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};

export const deleteCategory = {
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
};
