import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as CC from "./cart.controller.js";
import * as CV from "./cart.validation.js";
const router = Router();

router.post(
  "/",
  validation(CV.createCart),
  auth(Object.values(systemRoles)),
  CC.addToCart
);
router.patch(
  "/",
  validation(CV.deleteProductCart),
  auth(Object.values(systemRoles)),
  CC.removeCart
);

router.put(
  "/",
  validation(CV.clearCart),
  auth(Object.values(systemRoles)),
  CC.clearCart
);
router.get(
  "/",
  validation(CV.clearCart),
  auth(Object.values(systemRoles)),
  CC.getCart
);
export default router;
