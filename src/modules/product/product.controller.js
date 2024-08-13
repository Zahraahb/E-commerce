import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";

import { customAlphabet, nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import brandModel from "../../../db/models/brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";

import productModel from "../../../db/models/product.model.js";
import { ApiFeature } from "../../../utils/apiFeatures.js";

//==============================addProduct===================================
export const addProduct = asyncHandler(async (req, res, next) => {
  const {
    description,
    title,
    price,
    discount,
    stock,
    brand,
    subCategory,
    category,
  } = req.body;

  //check if category exists
  const categoryExist = await categoryModel.findOne({
    _id: category,
  });
  !categoryExist && next(new AppError("category not exist!", 409));

  //check if subCategory exists
  const subCategoryExist = await subCategoryModel.findOne({
    _id: subCategory,
    category: category,
  });
  !subCategoryExist && next(new AppError("subCategorynot not exist!", 409));

  //check if brand exists
  const brandExist = await brandModel.findOne({
    _id: brand,
  });
  !brandExist && next(new AppError("brand not exist!", 409));

  //check if product exists
  const productExist = await productModel.findOne({
    title: title.toLowerCase(),
  });
  productExist && next(new AppError("product already exists!", 409));

  const subPrice = price - (price * (discount || 0)) / 100;

  if (!req.files) {
    return next(new AppError("images are required!", 409));
  }

  const customId = nanoid(5);
  let list = [];
  //upload cover images
  for (const file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/coverImages`,
      }
    );
    list.push({ secure_url, public_id });
  }
  //upload image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}`,
    }
  );

  const product = await productModel.create({
    title,
    slug: slugify(title, {
      replacement: "_",
      lower: true,
    }),
    description,
    price,
    subPrice,
    discount,
    stock,
    coverImages: list,
    image: { secure_url, public_id },
    brand,
    subCategory,
    category,
    customId,
    createdBy: req.user._id,
  });

  return res.status(200).json({ msg: "done", product });
});

//===========================getProducts================================
export const getProducts = asyncHandler(async (req, res, next) => {
  const apiFeature = new ApiFeature(productModel.find(), req.query)
    .pagination()
    .select()
    .sort()
    .search()
    .filter();

  const products = await apiFeature.mongooseQuery;

  return res.status(200).json({ msg: "done", page: apiFeature.page, products });
});

//==============================updateProduct===================================
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    description,
    title,
    price,
    discount,
    stock,
    brand,
    subCategory,
    category,
  } = req.body;

  //check if category exists
  const categoryExist = await categoryModel.findOne({
    _id: category,
  });
  !categoryExist && next(new AppError("category not exist!", 409));

  //check if subCategory exists
  const subCategoryExist = await subCategoryModel.findOne({
    _id: subCategory,
    category: category,
  });
  !subCategoryExist && next(new AppError("subCategorynot not exist!", 409));

  //check if brand exists
  const brandExist = await brandModel.findOne({
    _id: brand,
  });
  !brandExist && next(new AppError("brand not exist!", 409));

  //check if product exists
  const product = await productModel.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  !product && next(new AppError("product not exist!", 409));

  if (title) {
    if (title.toLowerCase() == title) {
      return next(new AppError("title match old title!", 409));
    }
    if (await productModel.findOne({ title: title.toLowerCase() })) {
      return next(new AppError("title already exists!", 409));
    }
    product.title = title.toLowerCase();
    product.slug = slugify(title, {
      lower: true,
      replacement: "_",
    });
  }
  if (description) {
    product.description = description;
  }
  if (stock) {
    product.stock = stock;
  }
  if (price && discount) {
    product.subPrice = price - price * (discount / 100);
    product.price = price;
    product.discount = discount;
  } else if (price) {
    product.subPrice = price - price * (product.discount / 100);
    product.price = price;
  } else if (discount) {
    product.subPrice = product.price - product.price * (product.discount / 100);
    product.discount = discount;
  }
  jn;
  if (!req.files) {
    if (req.files?.image.length) {
      await cloudinary.uploader.destroy(product.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}`,
        }
      );
      product.image = { secure_url, public_id };
    }

    if (req.files?.coverImages?.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`
      );

      let list = [];
      for (const coverImage of req.files.coverImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          coverImage.path,
          {
            folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`,
          }
        );
        list.push({ secure_url, public_id });
      }
    }
    product.coverImages = list;
  }

  await product.save();

  return res.status(200).json({ msg: "done", product });
});

//=============================deleteProduct========================
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  //check if product exists
  const product = await productModel.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  !product && next(new AppError("product not exist!", 409));

   const categoryId = product.category;
   const category = await categoryModel.findById(categoryId);
   const subcategoryId = product.subCategory;
   const subCategory = await subCategoryModel.findById(subcategoryId);

  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
  );
   await cloudinary.api.delete_folder(
     `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
   );
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}`
  );
   await cloudinary.api.delete_folder(
     `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}`
   );

  await productModel.deleteOne({ _id: id });

  return res.status(200).json({ msg: "done" });
});

//===========================getSpecificProduct================================
export const getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  //check if product exists
  const product = await productModel.findOne({
    _id: id,
  });
  if (!product) return next(new AppError("Product not found!", 404));

  return res.status(200).json({ msg: "done", product });
});
