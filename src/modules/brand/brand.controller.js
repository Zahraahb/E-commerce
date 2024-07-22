import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";

import { sendEmail } from "../../service/sendEmail.js";
import { customAlphabet, nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import brandModel from "../../../db/models/brand.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";

//==============================addbrand===================================
export const addbrand = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const brandExist = await brandModel.findOne({ name: name.toLowerCase() });
 if(brandExist){
   return next(new AppError("brand already exists!", 409));
 
 }
 
  if(!req.file){
    return next(new AppError("image is required", 409));
  }
 

  const customId = nanoid(5)

  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {
    folder:`Ecommerce/brands/${customId}`,
  })

  const brand = await brandModel.create({
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

 
  return res.status(200).json({msg:"done", brand})

});


//==============================updateBrand===================================
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const { id } = req.params;

  const brand = await brandModel.findOne({_id:id, createdBy: req.user._id});
  if(!brand) { 
    return next(new AppError("brand not exist!", 409));}

  if(name){
    if(brand.name == name.toLowerCase()){
      return next(new AppError("name cannot be same", 409));
    }

    if(await brandModel.findOne({name:name.toLowerCase()})){
      return next(new AppError("brand already exists!", 409));
    }
    brand.name = name.toLowerCase()
    brand.slug = slugify(name,{
      replacement:"_",
      lower: true,
    });
    
  }
  if(req.file){
    await cloudinary.uploader.destroy(brand.image.public_id)
     const { secure_url, public_id } = await cloudinary.uploader.upload(
       req.file.path,
       {
         folder: `Ecommerce/brands/${brand.customId}`,
       }
     );
     brand.image = { secure_url, public_id };

  }
  if(!name && !req.file){
    return next(new AppError("nothing to update!", 409));
  }

  await brand.save();
  return res.status(200).json({msg:"done", brand})

});

//============================getBrands=================================
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await brandModel
    .find()
    .sort({ createdAt: -1 })
    .select("-createdBy -customId -createdAt -updatedAt ");
  res.status(200).json({ msg: "done", brands });
});

//============================getSpecificBrand=================================
export const getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel
   .findById(id)
   .select("-createdBy -customId -createdAt -updatedAt ");
  if (!brand) {
    return next(new AppError("brand not found!", 404));
  }
  res.status(200).json({ msg: "done", brand });
});


//============================deleteBrand=================================
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findOneAndDelete({ _id: id, createdBy:req.user._id });
  if (!brand) {
    return next(
      new AppError("brand not found or you have no permission!", 404)
    );
  }

  //delete from cloudinary

  //delete images from folder
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/brands/${brand.customId}`
  );
  //delete folder from cloudinary
  await cloudinary.api.delete_folder(`Ecommerce/brands/${brand.customId}`);

  return res.status(200).json({ msg: "brand deleted successfully" });
});

