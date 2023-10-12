import { Router } from "express";
import { create, getById, getList } from "@/controllers/ad";

const router = Router();

router.get("/", getList);
router.get("/:id", getById);
router.post("/", create);

export default router;
