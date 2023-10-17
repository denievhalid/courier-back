import { Router } from "express";
import { create, me } from "@/controllers/user";

const router = Router();

router.post("/", create);
router.get("/me", me);

export default router;
