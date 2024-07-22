import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";
import { AppError } from "../../utils/classError.js";
import { asyncHandler } from "../../utils/globalErrorHandler.js";

//fwye__ is what token starts with
export const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return next(new AppError("token not exist!", 409));
      // return res.status(409).json({ msg: "token not exist!" });
    }
    if (!token.startsWith("fwye__")) {
      return next(new AppError("token not exist!", 409));
      // return res.status(409).json({ msg: "token not exist!" });
    }
    const newToken = token.split("fwye__")[1];
    if (!newToken) {
      return next(new AppError("token not exist!", 409));
      // return res.status(409).json({ msg: "token not exist!" });
    }
    const decoded = jwt.verify(newToken, "oyznr");
    if (!decoded.id) {
      return next(new AppError("invalid payload!", 409));
      // return res.status(409).json({ msg: "invalid payload!" });
    }
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new AppError("invalid user", 409));
      // return res.status(409).json({ msg: "invalid user!" });
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
