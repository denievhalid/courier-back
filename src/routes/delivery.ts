import { Router } from "express";
import { create } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);

export default router;
