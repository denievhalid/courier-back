import { Router } from "express";
import { getList } from "@/controllers/ad";

const router = Router();

router.get("/", getList);

export default router;
