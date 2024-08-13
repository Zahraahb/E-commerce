import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as WC from "./wishlist.controller.js";
import * as WV from "./wishlist.validation.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validation(WV.addToWishList),
  auth(Object.values(systemRoles)),
  WC.addToWishList
);

router.patch(
  "/",
  validation(WV.addToWishList),
  auth(Object.values(systemRoles)),
  WC.removeFromWishList
);
router.get("/",validation(WV.getWishList),auth(),WC.getUserWishList)

export default router;
