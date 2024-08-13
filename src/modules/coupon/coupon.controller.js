import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import categoryModel from "../../../db/models/category.model.js";
import brandModel from "../../../db/models/brand.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import couponModel from "../../../db/models/coupon.model.js";

//==============================addCoupon===================================
export const addCoupon = asyncHandler(async (req, res, next) => {
  const { code, amount, fromDate , toDate} = req.body;
  const  couponExist = await  couponModel.findOne({ code: code.toLowerCase() });
 if( couponExist){
   return next(new AppError(" coupon already exists!", 409));
 
 }
 
  const  coupon = await  couponModel.create({
    code,
    amount,
    fromDate,
    toDate,
    createdBy: req.user._id,
  });
  req.data = {
    model: couponModel,
    id: coupon._id,
  };


 
  return res.status(200).json({msg:"done",  coupon})

});


//==============================updateCoupon===================================
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount, fromDate , toDate } = req.body;
  const coupon = await couponModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    {
      code,
      amount,
      fromDate,
      toDate,
    },
    {new: true}
  );
 if( !coupon){
   return next(new AppError(" coupon not exist or you are not authorized!", 409));
 
 }
 if(code){
    if(coupon.code == code.toLowerCase()){
      return next(new AppError("name cannot be same", 409));
}}
 

  return res.status(200).json({msg:"done",  coupon})

});
//===============================getAllCoupon==========================
export const getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await couponModel
    .find()
    .select("code amount fromDate toDate");
   

  return res.status(200).json({ msg: "done", coupons });
});

//==============================deleteCoupon========================
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await couponModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!coupon) {
    return next(new AppError("coupon not found or you are not authorized!", 409));
  }

  return res.status(200).json({ msg: "done" });
});






