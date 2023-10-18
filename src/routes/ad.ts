import { Router } from "express";
import { create, getById, getList } from "@/controllers/ad";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/", getList);
router.get("/:id", getById);
router.post("/", authenticate, create);

export default router;
