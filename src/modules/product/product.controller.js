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

//==============================addProduct===================================
export const addProduct = asyncHandler(async (req, res, next) => {
  const {
    description,
    title,
    price,
    discount,
    stock,
    rateAvg,
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
    rateAvg,
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
  //pagination
  let page = req.query.page * 1 || 1;
  if (page < 1) {
    page = 1;
  }
  let limit = req.query.limit || 10;
  let skip = (parseInt(page) - 1) * limit;

  // fillter
  let excludeQuery = ["page","limit", "sort", "search", "select"];
  let filterQuery = { ...req.query };
  excludeQuery.forEach((ele) => delete filterQuery[ele]);
  filterQuery = JSON.parse(
    JSON.stringify(filterQuery).replace(
      /(gt|lt|gte|lte|eq|in)/,
      (match) => `$${match}`
    )
  );

  const mongooseQuery = productModel
    .find(filterQuery)
    .skip(skip)
    .limit(limit)
    .populate("category subCategory brand");

  //sort
  if (req.query.sort) {
    mongooseQuery.sort(req.query.sort.replaceAll(",", " "));
  }

  //select
  if (req.query.select) {
    mongooseQuery.select(req.query.select.replaceAll(",", " "));
  }

  //search
  if(req.query.search){
    mongooseQuery.find({
      $or: [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ],
    });

  }
  const products = await mongooseQuery;

  return res.status(200).json({ msg: "done", page, products });
});
