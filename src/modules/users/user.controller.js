import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../../utils/classError.js";
import { asyncHandler } from "../../../utils/globalErrorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../../service/sendEmail.js";
import { customAlphabet } from "nanoid";

//==============================signup===================================
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, age, address, cPassword ,role} = req.body;
  const emailExist = await userModel.findOne({ email: email.toLowerCase() });
  emailExist && next(new AppError("user already exists!", 409));

  const token = jwt.sign({ email, phone }, process.env.email_confirmKey, {
    expiresIn: 60 * 2,
  });
  const link = `${req.protocol}://${req.headers.host}/users/confirmEmail/${token}`;

  const refToken = jwt.sign({ email, phone }, process.env.email_refConfirmKey);
  const refLink = `${req.protocol}://${req.headers.host}/users/refreshToken/${refToken}`;

  const checkEmail = await sendEmail(
    email,
    "Sign up confirmation",
    `<a href="${link}">click here confirm your email (link expires after 2 mins)</a><br>
    <a href="${refLink}">click here to resend the link</a>`
  );
  if (!checkEmail) {
    return next(
      new AppError(
        "can not send confirmatio link to this email, check if your email correct!",
        409
      )
    );
  }
  const hashPassword = bcrypt.hashSync(
    password,
    Number(process.env.salt_rounds)
  );

  const user = new userModel({
    name,
    email,
    password: hashPassword,
    phone,
    age,
    address,
    role
  });
  const newUser = await user.save();
  newUser
    ? res.status(201).json({ msg: "User created successfully", user })
    : next(new AppError("fail to create user", 409));
});

//==============================confirmEmail===================================
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.email_confirmKey);
  if (!decoded) {
    return next(new AppError("Invalid token", 409));
  }
  if (!decoded?.email) {
    return next(new AppError("Invalid payload", 409));
  }

  const user = await userModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true },
    { new: true }
  );
  user
    ? res.status(200).json({ msg: "done" })
    : next(new AppError("user not found or already confirmed!", 409));
});


//==============================refreshToken===================================
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refToken } = req.params;
  const decoded = jwt.verify(refToken, process.env.email_refConfirmKey);
  if (!decoded) {
    return next(new AppError("Invalid token", 409));
  }
  if (!decoded?.email) {
    return next(new AppError("Invalid payload", 409));
  }
   const user = await userModel.findOne(
     { email: decoded.email, confirmed: true },
   );

   if (user) {
        return next(new AppError("user already confirmed!", 409));
    }

   const token = jwt.sign({ email:decoded.email }, process.env.email_confirmKey, {
     expiresIn: 60 * 2,
   });
   const link = `${req.protocol}://${req.headers.host}/users/confirmEmail/${token}`;

   await sendEmail(
     decoded.email,
     "Sign up confirmation",
     `<a href="${link}">click here to resend the link</a>`
   );

  return res.status(200).json({ msg: "done" })
  
});

//==============================forgetPassword===================================
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email:email.toLowerCase() });

  if (!user) {
    return next(new AppError("user not found!", 409));
  }
  const code = customAlphabet("0123456789",6)
  const OTP = code();
  user.OTP = OTP;
  const OTPExpierTime = Date.now() + 300000; //OTP expires in 5 minutes
  user.OTPExpierTime = OTPExpierTime;
  await user.save();

  const checkEmail = await sendEmail(
    email,
    "Reset Your Password",
    `<h2>your reset code : ${OTP} (expires after 5 mins)</h2>`
  );
  if (!checkEmail) {
    return next(new AppError("can not send email!", 409));
  }

  return res.status(200).json({ msg: "reset code sent to your email" });
});


//==============================resetPassword===================================
 export const resetPassword = asyncHandler(async (req, res, next) => {
   const { email, resetCode, newPassword } = req.body;

   const user = await userModel
     .findOne({ email:email.toLowerCase(), OTP: resetCode })
     .where("OTPExpierTime")
     .gt(Date.now());
   if (!user || resetCode == "") {
     return next(
       new AppError("worng email or Invalid code or expired code!", 409)
     );
   }
   const hashPassword = bcrypt.hashSync(
     newPassword,
     Number(process.env.salt_rounds)
   );
   const updatePassword = await userModel.findByIdAndUpdate(
     user._id,
     { password: hashPassword, OTP: "", OTPExpierTime: "" , passwordChangeAt:Date.now()},
     { new: true }
   );
   return res.status(200).json({ msg: "Password reset successfully" });
 });

 //==============================signIn===================================
 export const signIn = asyncHandler(async (req, res, next) => {
   const { email,password } = req.body;

   const user = await userModel
     .findOne({ email:email.toLowerCase(), confirmed:true })
    
   if (!user ) {
     return next(
       new AppError("user not found or already logged in!", 409)
     );
   }
   const match = bcrypt.compareSync(password, user.password);
   if (!match) {
     return next(
       new AppError("wrong password or email!", 409)
     );
   }
   
 
   const logIn = await userModel.updateOne({email},{loggedIn: true},{new: true});
   !logIn && next(new AppError("failed to log in", 409));
   const token = jwt.sign(
     {
       id: user._id,
       email: user.email,
       role: user.role,
     },
     "oyznr",
     
   );

   
   return res.status(200).json({ msg: "user logged in successfully" ,token});
 });

 //==============================signOut===================================
 export const signOut = asyncHandler(async (req, res, next) => {
   const { id } = req.user;
   const logOut = await userModel.updateOne({_id:id},{loggedIn: false},{new: true});
   logOut && res.status(200).json({ msg: "user logged out successfully" });
 });

 //==============================getUser===================================
 export const getAccount = asyncHandler(async (req, res, next) => {
   return res.status(200).json({ msg: "done", user: req.user });
 });


 //==============================updateUser===================================
 export const updateUser = asyncHandler(async (req, res, next) => {
   const { id } = req.user;
   const { name, email, phone, age, address } = req.body;
   const userExists = await userModel.findOne({ email:email.toLowerCase() });
   if (userExists) {
     return next(new AppError("email already exists!", 409));
   }

   const user = await userModel.findByIdAndUpdate(
     id,
     { name, email, phone, age, address },
     { new: true }
   );
   user
    ? res.status(200).json({ msg: "User updated successfully", user })
     : next(new AppError("user not found", 409));
 });

 //==============================deleteUser===================================
 export const deleteAccount = asyncHandler(async (req, res, next) => {
   const { id } = req.user;
   const user = await userModel.findByIdAndDelete(id);
   user
    ? res.status(200).json({ msg: "User deleted successfully" })
     : next(new AppError("user not found", 404));
    })
