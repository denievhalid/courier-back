import { Router } from "express";
import { create } from "@/controllers/dialog";

const router = Router();

router.post("/", create);

export default router;
