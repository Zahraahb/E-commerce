import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import reviewModel from "../../../db/models/review.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";

//==============================addReview===================================
export const addReview = asyncHandler(async (req, res, next) => {
  const { comment, rate } = req.body;
  const { productId } = req.params;

  //check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("Product not exist!", 404));
  }

  // check if user reviewed product
  const reviewExist = await reviewModel.findOne({
    createdBy: req.user.id,
    productId,
  });
  if (reviewExist) {
    return next(new AppError("You have already reviewed this product!", 409));
  }

  //check if user ordered product to be able to review
  const orderExist = await orderModel.findOne({
    user: req.user._id,
    "products.productId": productId,
    status: "delivered",
  });
  if(!orderExist){
    return next(new AppError("You must have ordered and recived this product to review!", 409));
  }

  const review = await reviewModel.create({
    comment,
    rate,
    createdBy: req.user.id,
    productId,
  })



  let sum = product.rateAvg * (product.rateNum ||0);
  sum = sum + rate
  
  product.rateAvg = sum / (product.rateNum + 1 ||0)
  product.rateNum +=1
  await product.save()
  

  return res.status(200).json({ msg: "done", review });
});

//==============================getProductReviews===================================
export const getReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId)

  if(!product) {
    return next(new AppError("Product not exist!", 404));
  }

  const reviews = await reviewModel
   .find({ productId })
   .populate("createdBy", "name")
   .sort({ createdAt: -1 });

  return res.status(200).json({ msg: "done", reviews });
});
