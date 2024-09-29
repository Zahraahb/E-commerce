import { Router } from "express";
import { systemRoles } from "../../../utils/commen/enum.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, vaildExtentions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import * as OC from "./order.controller.js";
import * as OV from "./order.validation.js";
import express from "express";
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
// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_efada6c1b6c5a44bf9699c56868928adce9898140343da990157bf9a3f2cea23";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),OC.webhook

);


router.get(
  "/",
  validation(OV.getUserOrders),
  auth(Object.values(systemRoles)),
  OC.getUserOrders
);
router.get("/success/:orderId", OC.successPayment);

export default router;
