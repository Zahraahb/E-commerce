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
import { objectIdValidation } from "../../../utils/commen/generalValidation.js";
import mongoose from "mongoose"
import subCategoryModel from "../../../db/models/subCategory.model.js";

//==============================addCategory===================================
export const addCategory = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const categoryExist = await categoryModel.findOne({ name: name.toLowerCase() });
  categoryExist && next(new AppError("category already exists!", 409));

  if(!req.file){
    return next(new AppError("image is required", 409));
  }
 

  const customId = nanoid(5)
  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {
    folder:`Ecommerce/categories/${customId}`,
  })
  req.filePath = `Ecommerce/categories/${customId}`

  const category = await categoryModel.create({
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
    createdBy: req.user._id,
  });

  req.data = {
    model: categoryModel,
    id: category._id
  }
  
  return res.status(200).json({msg:"done",category})

});


//==============================updateCategory===================================
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const { id } = req.params;

  const category = await categoryModel.findOne({_id:id, createdBy: req.user._id});
  if(!category) { 
    return next(new AppError("category not exist!", 409));}

  if(name){
    if(category.name == name.toLowerCase()){
      return next(new AppError("name cannot be same", 409));
    }

    if(await categoryModel.findOne({name:name.toLowerCase()})){
      return next(new AppError("category already exists!", 409));
    }
    category.name = name.toLowerCase()
    category.slug = slugify(name,{
      replacement:"_",
      lower: true,
    });
    
  }
  if(req.file){
    await cloudinary.uploader.destroy(category.image.public_id)
     const { secure_url, public_id } = await cloudinary.uploader.upload(
       req.file.path,
       {
         folder: `Ecommerce/categories/${category.customId}`,
       }
     );
     category.image = { secure_url, public_id };

  }

  await category.save();
  return res.status(200).json({msg:"done",category})

});

//=========================getAllCategories========================
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryModel.aggregate([
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subCategories",
      },
    },
    
    {
      $project: {
        createdAt: 0,
        updatedAt: 0,
        createdBy: 0,
        customId: 0,
        "subCategories.createdAt": 0,
        "subCategories.updatedAt": 0,
        "subCategories.createdBy": 0,
        "subCategories.customId": 0,
        "subCategories.category": 0,
      },
    },
  ]);
    
    
  return res.status(200).json({msg:"done", categories})
});

//=========================getCategoryById========================
export const getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel
    .aggregate([{
      $match: {_id: new mongoose.Types.ObjectId(id)},
    },{
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subCategories",
      },
    },{
      $project: {
        createdAt: 0,
        updatedAt: 0,
        createdBy: 0,
        customId: 0,
        "subCategories.createdAt": 0,
        "subCategories.updatedAt": 0,
        "subCategories.createdBy": 0,
        "subCategories.customId": 0,
        "subCategories.category": 0,
      },
    }]);
  return res.status(200).json({ msg: "done", category });
});

//============================deleteCategory==========================
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findOneAndDelete({_id:id, createdBy: req.user._id});
  if (!category) {
    return next(new AppError("category not found or you have no permission!", 404));
  }
  //delete subCategories of category 
  await subCategoryModel.deleteMany({category: category._id})

  //delete from cloudinary
  //delete images from folder
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}`
  );
  //delete folder from cloudinary
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}`
  );
  return res.status(200).json({ msg: "category deleted successfully" });
});


