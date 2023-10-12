import { Router } from "express";
import { sendOtp, validateOtp } from "@/controllers/auth";

const router = Router();

router.post("/otp/send", sendOtp);
router.post("/otp/validate", validateOtp);

export default router;
