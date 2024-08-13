import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import cartModel from "../../../db/models/cart.model.js";
import productModel from "../../../db/models/product.model.js";
import orderModel from "../../../db/models/order.model.js";
import couponModel from "../../../db/models/coupon.model.js";
import { createInvoice } from "../../../utils/pdf.js";
import { sendEmail } from "../../service/sendEmail.js";
import { payment } from "../../../utils/payment.js";
import Stripe from "stripe";


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
    product.price = productExist.subPrice;
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
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
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

  const invoice = {
    shipping: {
      name: req.user.name,
      address: req.user.address,
      city: "sidi gaber",
      state: "Alexandria",
      country: "EGY",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: order.subPrice,
    paid: order.totalPrice,
    invoice_nr: order._id,
    date: order.createdAt,
    coupon: req.body?.coupon?.amount || 0,
  };
 
  await createInvoice(invoice, "invoice.pdf");

  await sendEmail(
    req.user.email,
    "order placed",
    "your order has been placed successfully",
    [{
      path:"invoice.pdf",
      contentType:"application/pdf"
    }]
  );

  if (paymentMethod == "card"){
    const stripe  = new Stripe(process.env.stripe_secret)
    if (req.body?.coupon){
      const coupon = await stripe.coupons.create({
        percent_off: req.body?.coupon.amount,
        duration: "once"
      })
      req.body.couponId = coupon.id
    }

    const session = await payment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: req.body?.couponCode
        ? [{ coupon: req.body.couponId }]
        : [],
    });

    return res.status(200).json({ msg: "done", url: session.url});

  }
  return res.status(200).json({ msg: "done", order });
});
//=======================successfulPayment=========================

export const successPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findOneAndUpdate(
    { _id: orderId },
    {
      status: "paid",
    },
    { new: true }
  );

  if (!order) {
    return next(new AppError("Order not exist!", 409));
  }

  
    return res.status(200).json({ msg: "Payment successful"});
  })

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
  await orderModel.updateOne(
    { _id: id },
    {
      status: "cancelled",
      cancelledBy: req.user._id,
      reason,
    }
  );

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

//==============================getUserOrders===========================
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await orderModel.find({
    user: req.user._id,
  });
  if (!orders) {
    return next(new AppError("no order for this user !", 409));
  }

  return res.status(200).json({ msg: "done", orders });
});
