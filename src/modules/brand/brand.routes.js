import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as BC from "./brand.controller.js";
import * as BV from "./brand.validation.js";
const router = Router();

router.post(
  "/add-brand",
  multerHost(vaildExtentions.image).single("image"),
  validation(BV.createBrand),
  auth([systemRoles.ADMIN]),
  BC.addbrand
);
router.patch(
  "/update-brand/:id",
  multerHost(vaildExtentions.image).single("image"),
  validation(BV.updateBrand),
  auth([systemRoles.ADMIN]),
  BC.updateBrand
);
router.get("/", BC.getBrands);
router.get("/:id",validation(BV.specificBrand) ,BC.getBrand);
router.delete(
  "/delete/:id",
  validation(BV.deleteBrand),
  auth([systemRoles.ADMIN]),
  BC.deleteBrand
);


export default router;
