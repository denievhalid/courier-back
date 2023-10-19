import { Router } from "express";
import { create, me, removeAvatar, updateAvatar } from "@/controllers/user";
import { authenticate } from "@/middlewares/authenticate";
import multer from "@/lib/multer";

const router = Router();

router.post("/", create);
router.get("/me", authenticate, me);
router.patch("/avatar", authenticate, multer.single("avatar"), updateAvatar);
router.delete("/avatar", authenticate, removeAvatar);

export default router;
