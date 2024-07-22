import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as SCC from "./subCategory.controller.js";
import * as SCV from "./subCategory.validation.js";
const router = Router({ mergeParams: true });

router.post(
  "/add-subCategory",
  multerHost(vaildExtentions.image).single("image"),
  validation(SCV.createSubCategory),
  auth([systemRoles.ADMIN]),
  SCC.addSubCategory
);
router.patch(
  "/update-subCategory/:id",
  multerHost(vaildExtentions.image).single("image"),
  validation(SCV.updateSubCategory),
  auth([systemRoles.ADMIN]),
  SCC.updateSubCategory
);
router.get("/", SCC.getAllSubCategories);
router.get("/:id", validation(SCV.specificSubCategory), SCC.getSubCategory);
router.delete(
  "/delete/:id",
  validation(SCV.deleteSubCategory),
  auth([systemRoles.ADMIN]),
  SCC.deleteSubCategory
);

export default router;
