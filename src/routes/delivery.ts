import { Router } from "express";
import { create, remove, update, getByAdId } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.post("/", authenticate, create);
router.get("/", authenticate, getByAdId);
router.patch("/", authenticate, update);
router.delete("/", authenticate, remove);

export default router;
