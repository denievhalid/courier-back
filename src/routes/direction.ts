import { Router } from "express";
import { create, getList, remove } from "@/controllers/direction";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", authenticate, getList);
router.post("/", authenticate, create);
router.delete("/", authenticate, remove);

export default router;
