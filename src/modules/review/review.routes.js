import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as RC from "./review.controller.js";
import * as RV from "./review.validation.js";
const router = Router({ mergeParams: true });

router.post("/", validation(RV.addReview), auth(), RC.addReview);
router.get("/:productId", validation(RV.getReviews), RC.getReviews);

export default router;
