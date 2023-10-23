import { Router } from "express";
import { create, getById, getList } from "@/controllers/dialog";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/inbox", authenticate, getList);
router.get("/messages/:dialogId", authenticate, getById);
router.post("/", authenticate, create);

export default router;
