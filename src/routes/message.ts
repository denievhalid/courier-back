import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { create, getList } from "@/controllers/message";

const router = Router();

router.get("/:conversation", authenticate, getList);
router.post("/", authenticate, create);

export default router;
