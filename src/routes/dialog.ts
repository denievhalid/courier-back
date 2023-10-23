import { Router } from "express";
import { create, getById, getList, sendMessage } from "@/controllers/dialog";
import { authenticate } from "@/middlewares/authenticate";

const router = Router();

router.get("/inbox", authenticate, getList);
router.get("/messages/:dialogId", authenticate, getById);
router.post("/", authenticate, create);
router.post("/:dialogId/message", authenticate, sendMessage);

export default router;
