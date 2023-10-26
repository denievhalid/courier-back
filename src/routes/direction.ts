import { Router } from "express";
import { create, getList } from "@/controllers/direction";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", authenticate, getList);
router.post("/", authenticate, create);

export default router;
