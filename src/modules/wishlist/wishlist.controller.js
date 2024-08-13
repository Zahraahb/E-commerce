import productModel from "../../../db/models/product.model.js";
import wishlistModel from "../../../db/models/wishlist.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";

//==============================addProductToWishList===================================
export const addToWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("Product not exist!", 404));
  }

  const wishListExist = await wishlistModel.findOne({ user: req.user.id });
  if (!wishListExist) {
    const newWishList = await wishlistModel.create({
      user: req.user.id,
      products: [productId],
    });
    return res
      .status(200)
      .json({
        msg: "Product added to wishlist successfully",
        wishList: newWishList,
      });
  }

  const wishList = await wishlistModel.findOneAndUpdate(
    { user: req.user.id },
    {
      $addToSet: { products: productId },
    },
    { new: true }
  );

  return res.status(200).json({
    msg: "Product added to wishlist successfully",
    wishList,
  });
});

//============================remove product from wishlist==========================
export const removeFromWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const wishList = await wishlistModel.findOneAndUpdate(
    { user: req.user.id, products: { $in: productId } },
    {
      $pull: { products: productId },
    },
    { new: true }
  );

  if (!wishList) {
    return next(new AppError("Product not found in wishlist!", 404));
  }

  return res
    .status(200)
    .json({ msg: "Product removed from wishlist successfully", wishList });
});

//============================get user wishlist========================================
export const getUserWishList = asyncHandler(async (req, res, next) => {
  const wishList = await wishlistModel
    .findOne({ user: req.user.id })
    .populate("products");

  if (!wishList) {
    return next(new AppError("Wishlist not found!", 404));
  }

  return res.status(200).json({ msg: "done", wishList });
});
