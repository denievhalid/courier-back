import { Router } from "express";
import { create, remove } from "@/controllers/block";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);
router.delete("/", authenticate, remove);

export default router;
