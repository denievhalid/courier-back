import { Router } from "express";
import { create, update } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);
router.patch("/", authenticate, update);

export default router;
