import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { create, getList, update } from "@/controllers/message";

const router = Router();

router.get("/:conversation", authenticate, getList);
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);

export default router;
