import { Router } from "express";
import { create, getById, getList, remove } from "@/controllers/direction";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", authenticate, getList);
router.get("/:directionId", authenticate, getById);
router.post("/", authenticate, create);
router.delete("/", authenticate, remove);

export default router;
