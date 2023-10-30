import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { create, getConversationsList } from "@/controllers/conversation";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.post("/", authenticate, create);

export default router;
