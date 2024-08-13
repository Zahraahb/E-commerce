import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as OC from "./order.controller.js";
import * as OV from "./order.validation.js";
const router = Router();

router.post(
  "/",
  validation(OV.createOrder),
  auth(Object.values(systemRoles)),
  OC.createOrder
);
router.patch(
  "/cancel-order/:id",
  validation(OV.cancelOrder),
  auth(Object.values(systemRoles)),
  OC.cancelOrder
);

router.get(
  "/",
  validation(OV.getUserOrders),
  auth(Object.values(systemRoles)),
  OC.getUserOrders
);
router.get("/success/:orderId", OC.successPayment);

export default router;
