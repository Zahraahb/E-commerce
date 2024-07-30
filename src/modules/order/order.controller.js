import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import cartModel from "../../../db/models/cart.model.js";
import productModel from "../../../db/models/product.model.js";
import orderModel from "../../../db/models/order.model.js";
import couponModel from "../../../db/models/coupon.model.js";

//==============================createOrder===================================
export const createOrder = asyncHandler(async (req, res, next) => {
  const { productId, quantity, couponCode, address, phone, paymentMethod } =
    req.body;

  if (couponCode) {
    const coupon = await couponModel.findOne({
      code: couponCode.toLowerCase(),
      usedBy: { $nin: [req.user.id] },
    });
    if (!coupon) {
      return next(new AppError("coupon not exist or already used!", 409));
    }
    if (coupon.toDate < Date.now()) {
      return next(new AppError("coupon expired!", 409));
    }
    req.body.coupon = coupon;
  }

  let products = [];
  let flag = false;

  if (productId) {
    products = [{ productId, quantity }];
  } else {
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart.products.length) {
      return next(new AppError("Cart is empty!", 409));
    }
    products = cart.products;
    flag = true;
  }

  let finalProducts = [];
  for (let product of products) {
    const productExist = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!productExist) {
      return next(new AppError("Product not exist or out of stock!", 409));
    }
    if (flag) {
      product = product.toObject(); //BSON to JSON
    }
    product.title = productExist.title;
    product.price = productExist.price;
    product.finalPrice = productExist.subPrice * product.quantity;
    finalProducts.push(product);
  }

  const order = await orderModel.create({
    user: req.user._id,
    products: finalProducts,
    subPrice: finalProducts.reduce((acc, curr) => acc + curr.finalPrice, 0),
    totalPrice:
      finalProducts.reduce((acc, curr) => acc + curr.finalPrice, 0) -
      (finalProducts.reduce((acc, curr) => acc + curr.finalPrice, 0) *
        (req.body.coupon?.amount || 0)) /
        100,
    address,
    phone,
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "waiting",
    couponId: req.body?.coupon?._id,
  });

  // save user how used coupon in coupon collection
  if (order && req.body.coupon) {
    await couponModel.updateOne(
      { _id: req.body.coupon._id },
      { $push: { usedBy: req.user.id } }
    );
  }

  //decrease stock after placing order
  finalProducts.forEach(async (product) => {
    await productModel.findByIdAndUpdate(
      { _id: product.productId },
      {
        $inc: { stock: -product.quantity },
      }
    );
  });

  //clear cart after placing order
  if (flag) {
    await cartModel.updateOne({ user: req.user._id }, { products: [] });
  }

  return res.status(200).json({ msg: "done", order });
});

//==============================cancelOrder============================
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await orderModel.findOneAndUpdate({
    user: req.user._id,
    _id: id,
  });
  if (!order) {
    return next(new AppError("Order not exist !", 409));
  }

  if (
    (order.paymentMethod == "cash" && order.status != "placed") ||
    (order.paymentMethod == "card" && order.status != "waitPayment")
  ) {
    return next(new AppError("Order cannot be cancelled !", 409));
  }
  await orderModel.updateOne({_id: id},{
    status: "cancelled",
    cancelledBy: req.user._id,
    reason,
  })

  if (order?.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user.id } }
    );
  }

  
  order.products.forEach(async (product) => {
    await productModel.findByIdAndUpdate(
      { _id: product.productId },
      {
        $inc: { stock: product.quantity },
      }
    );
  });

  return res.status(200).json({ msg: "Order cancelled successfully" });
});
