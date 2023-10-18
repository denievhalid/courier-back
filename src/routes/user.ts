import { Router } from "express";
import { create, me } from "@/controllers/user";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", create);
router.get("/me", authenticate, me);

export default router;
