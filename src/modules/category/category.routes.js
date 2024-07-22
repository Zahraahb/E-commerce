import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as CC from "./category.controller.js";
import * as CV from "./category.validation.js";
import subCategoryRouter from "../subCategory/subCategory.routes.js";
const router = Router();

router.use("/:categoryId/subCategories/", subCategoryRouter)

router.post(
  "/add-category",
  multerHost(vaildExtentions.image).single("image"),
  validation(CV.createCategory),
  auth([systemRoles.ADMIN]),
  CC.addCategory
);
router.patch(
  "/update-category/:id",
  multerHost(vaildExtentions.image).single("image"),
  validation(CV.updateCategory),
  auth([systemRoles.ADMIN]),
  CC.updateCategory
);

router.get("/", CC.getAllCategories);

router.get("/:id",validation(CV.specificCategory),CC.getCategory)

router.delete("/delete/:id",validation(CV.deleteCategory),auth([systemRoles.ADMIN]), CC.deleteCategory)


export default router;
