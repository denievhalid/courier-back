import { Router } from "express";
import { getById, getList } from "@/controllers/ad";

const router = Router();

router.get("/", getList);
router.get("/:id", getById);

export default router;
