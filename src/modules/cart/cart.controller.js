import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import cartModel from "../../../db/models/cart.model.js";
import productModel from "../../../db/models/product.model.js";

//==============================addCart===================================
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!product) {
    return next(new AppError("Product not found or out of stock!", 409));
  }

  const cartExist = await cartModel.findOne({ user: req.user.id });
  if (!cartExist) {
    const cart = await cartModel.create({
      user: req.user.id,
      products: [{ productId, quantity }],
    });
    return res.status(200).json({ msg: "done", cart });
  }

  let flag = false;

  for (const product of cartExist.products) {
    if (productId == product.productId) {
      product.quantity = quantity;
      flag = true;
      break;
    }
  }
  if (!flag) {
    cartExist.products.push({
      productId,
      quantity,
    });
  }
  await cartExist.save();
  return res.status(200).json({ msg: "done", cart: cartExist });
});

//==============================removeCart===================================
export const removeCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user.id,
      "products.productId": productId,
    },
    {
      $pull: { products: { productId } },
    },
    { new: true }
  );
  if (!cart) {
    return next(new AppError("Product not found in cart!", 409));
  }

  return res.status(200).json({ msg: "done", cart });
});

//==============================clearCart===================================
export const clearCart = asyncHandler(async (req, res, next) => {
  

  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user.id,
      
    },
    {
      products: [],
    },
    { new: true }
  );


  return res.status(200).json({ msg: "done" });
});

//==============================getCart===================================
export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user.id }).populate("products.productId");

  if(!cart){
    return next(new AppError("Cart is empty!", 409));  
  }
  return res.status(200).json({ msg: "done", cart });
});
