import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as PC from "./product.controller.js";
import * as PV from "./product.validation.js";
import reviewRouter from "../review/review.routes.js";
import wishListRouter from "../wishlist/wishlist.routes.js";
const router = Router({ mergeParams: true });

router.use("/:productId/reviews/", reviewRouter)
router.use("/:productId/wishList", wishListRouter )

router.post(
  "/add-product",
  multerHost(vaildExtentions.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 3 },
  ]),
  validation(PV.createProduct),
  auth([systemRoles.ADMIN]),
  PC.addProduct
);

router.get("/", PC.getProducts)
router.patch(
  "/update/:id",
  multerHost(vaildExtentions.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 3 },
  ]),
  validation(PV.updateProduct),
  auth([systemRoles.ADMIN]),
  PC.updateProduct
);

router.delete("/:id",validation(PV.deleteProduct), auth([systemRoles.ADMIN]),PC.deleteProduct )
router.get("/:id", validation(PV.specificProduct), PC.getProduct);
export default router;
