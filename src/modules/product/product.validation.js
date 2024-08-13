import joi from "joi";
import { generalFieldes } from "../../../utils/commen/generalFields.js";
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";

export const createProduct = {
  body: joi
    .object({
      title: joi.string().min(3).max(30).required(),
      description: joi.string(),
      price: joi.number().min(1).required(),
      discount: joi.number().min(0).max(100),
      stock: joi.number().min(0).required(),
      brand: joi.string().custom(objectIdValidation).required(),
      subCategory: joi.string().custom(objectIdValidation).required(),
      category: joi.string().custom(objectIdValidation).required(),
    })
    .required(),
  files: joi.object({
    image: joi.array().items(generalFieldes.file.required()).required(),
    coverImages: joi.array().items(generalFieldes.file).required(),
  }),
  headers: generalFieldes.headers.required(),
};

export const updateProduct = {
  body: joi.object({
    title: joi.string().min(3).max(30),
    description: joi.string(),
    price: joi.number().min(1),
    discount: joi.number().min(0).max(100),
    stock: joi.number().min(0),
    brand: joi.string().custom(objectIdValidation).required(),
    subCategory: joi.string().custom(objectIdValidation).required(),
    category: joi.string().custom(objectIdValidation).required(),
  }),
  files: joi.object({
    image: joi.array().items(generalFieldes.file.required()),
    coverImages: joi.array().items(generalFieldes.file),
  }),
  params: joi.object({
    id: joi.string().custom(objectIdValidation).required(),
  }),
  headers: generalFieldes.headers.required(),
};

export const specificProduct = {
 params: joi.object({
   id: joi.string().custom(objectIdValidation).required(),
   
  }),
 }

 export const deleteProduct = {
   params: joi.object({
     id: joi.string().custom(objectIdValidation).required(),
   }),
   headers: generalFieldes.headers.required(),
 };
