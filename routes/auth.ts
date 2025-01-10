import { Router } from "express";
import {
  signUp,
  signIn,
  verifyEmail,
  handleForgotPassword,
  handleResetPassword,
} from "../controllers/authController";

const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-email", verifyEmail);


router.post("/forgot-password", handleForgotPassword);
router.put("/reset-password/:token", handleResetPassword);

export default router;
