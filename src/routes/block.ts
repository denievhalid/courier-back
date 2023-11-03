import { Router } from "express";
import { create } from "@/controllers/block";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);

export default router;
