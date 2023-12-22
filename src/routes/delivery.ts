import { Router } from "express";
import { create, remove, update, getByAdId } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";
import { getAdMiddleware } from "@/controllers/delivery/middlewares";

const router = Router();

router.post("/", authenticate, getAdMiddleware, create);
router.get("/", authenticate, getByAdId);
router.patch("/", authenticate, getAdMiddleware, update);
router.delete("/:ad", authenticate, remove);

export default router;
