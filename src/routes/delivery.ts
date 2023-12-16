import { Router } from "express";
import { create, remove, update } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);
router.patch("/", authenticate, update);
router.delete("/:ad", authenticate, remove);

export default router;
