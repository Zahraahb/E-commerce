import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as CC from "./coupon.controller.js";
import * as CV from "./coupon.validation.js";
const router = Router();

router.post(
  "/add-coupon",
  validation(CV.createCoupon),
  auth([systemRoles.ADMIN]),
  CC.addCoupon
);
router.patch(
  "/update-coupon/:id",
  validation(CV.updateCoupon),
  auth([systemRoles.ADMIN]),
  CC.updateCoupon
);

export default router;
