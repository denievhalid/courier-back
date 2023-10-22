import { Router } from "express";
import { create, getList } from "@/controllers/dialog";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/inbox", authenticate, getList);
router.post("/", authenticate, create);

export default router;
