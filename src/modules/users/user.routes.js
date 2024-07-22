import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as UC from "./user.controller.js"
const router = Router();

router.post("/signup",UC.signup)
router.post("/sign-in", UC.signIn);
router.get("/confirmEmail/:token",UC.confirmEmail)
router.get("/refreshToken/:refToken", UC.refreshToken);
router.patch("/forget-password", UC.forgetPassword)
router.patch("/reset-password", UC.resetPassword);
router.get("/account",auth(),UC.getAccount)
router.patch("/sign-out",auth(),UC.signOut)
router.patch("/update", auth(), UC.updateUser);
export default router;
