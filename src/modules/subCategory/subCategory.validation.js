import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createSubCategory = {
  body: joi
    .object({
      name: joi.string().min(3).max(30).required(),
    })
    .required(),
  file: generalFieldes.file.required(),
  headers: generalFieldes.headers.required(),
  params: joi.object({
    categoryId: joi.string().custom(objectIdValidation).required(),
  }),
};

export const updateSubCategory = {
  body: joi.object({
    name: joi.string().min(3).max(30),
    category: joi.string().custom(objectIdValidation),
  }),
  file: generalFieldes.file,
  headers: generalFieldes.headers.required(),
};

export const specificSubCategory = {
 params: joi.object({
   id: joi.string().custom(objectIdValidation).required(),
   
  }),
 }

 export const deleteSubCategory = {
   params: joi.object({
     id: joi.string().custom(objectIdValidation).required(),
   }),
 };
