import { Router } from "express";
import { getList } from "@/controllers/favorite";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", authenticate, getList);

export default router;
