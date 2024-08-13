import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";
import { AppError } from "../../utils/classError.js";
import { asyncHandler } from "../../utils/globalErrorHandler.js";


export const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return next(new AppError("token not exist!", 409));
     
    }
    if (!token.startsWith(process.env.bearerKey)) {
      return next(new AppError("token not exist!", 409));
     
    }
    const newToken = token.split(process.env.bearerKey)[1];
    if (!newToken) {
      return next(new AppError("token not exist!", 409));
     
    }
    const decoded = jwt.verify(newToken, "oyznr");
    if (!decoded.id) {
      return next(new AppError("invalid payload!", 409));
      
    }
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new AppError("invalid user", 409));
      
    }

    //authuraization
    if (roles.length) {
      if (!roles.includes(user.role)) {
        return next(new AppError("You are not authorized", 409));
      }
    }
    if(user.changePasswordAt){
        if (parseInt(user.passwordChangeAt.getTime() / 1000) > decoded.iat) {
          return next(new AppError("token expired please login again", 409));
        }
    }
    req.user = user;
    next();
  });
};
