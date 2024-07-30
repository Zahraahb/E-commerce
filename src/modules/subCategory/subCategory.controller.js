import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../../service/sendEmail.js";
import { customAlphabet, nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { systemRoles } from "../../../utils/commen/enum.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";

//==============================addSubCategory===================================
export const addSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  
   const categoryExist = await categoryModel.findById(req.params.categoryId);
   if(!categoryExist){
    return next(new AppError("category not exist!", 409));
   }


  const subCategoryExist = await subCategoryModel.findOne({
    name: name.toLowerCase(),
  });
  subCategoryExist && next(new AppError("subCategory already exists!", 409));


 
  if (!req.file) {
    return next(new AppError("image is required", 409));
  }

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${customId}`,
    }
  );

  const subCategory = await subCategoryModel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: {
      secure_url,
      public_id,
    },
    customId,
    category: req.params.categoryId,
    createdBy: req.user._id,
  });
  return res.status(200).json({ msg: "done", subCategory });
});

//==============================updateSubCategory===================================
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { name,category } = req.body;
  const { id } = req.params;

  const subCategory = await subCategoryModel.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  if (!subCategory) {
    return next(new AppError("subCategory not exist!", 409));
  }
  const categoryOfSub = await categoryModel.findById(subCategory.category)

  if (name) {
    if (subCategory.name == name.toLowerCase()) {
      return next(new AppError("name cannot be same", 409));
    }

    if (await subCategoryModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("subCategory already exists!", 409));
    }
    subCategory.name = name.toLowerCase();
    subCategory.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if(category){
    if(!await categoryModel.findById(category)){
        return next(new AppError("category not exist!", 409));
        
    }
    subCategory.category = category;
  }

  if (req.file) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce/categories/${categoryOfSub.customId}/subCategories/${subCategory.customId}`,
      }
    );
    subCategory.image = { secure_url, public_id };
  }

  await subCategory.save();
  return res.status(200).json({ msg: "done", subCategory });
});

//==========================getAllSubCategories========================
export const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const subcategories = await subCategoryModel.find({}).select('name slug image category').populate("category", "name slug image");

  return res.status(200).json({ msg: "done", subcategories });
});
//=========================getSpecificSubCategory========================
export const getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await subCategoryModel.findById(id).select('name slug image category').populate("category", "name slug image");

  if (!subCategory) {
    return next(new AppError("subCategory not found!", 404));
  }
  return res.status(200).json({ msg: "done", subCategory });
});

//=========================deleteSubCategory============================
export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await subCategoryModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!subCategory) {
    return next(
      new AppError("subCategory not found or you have no permission!", 404)
    );
  }
  const categoryOfSub = await categoryModel.findById(subCategory.category);

  //delete from cloudinary
  //delete images from folder
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${categoryOfSub.customId}/subCategories/${subCategory.customId}`
  );
  //delete folder from cloudinary
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${categoryOfSub.customId}/subCategories/${subCategory.customId}`
  );

  return res.status(200).json({ msg: "Subcategory deleted successfully" });
});