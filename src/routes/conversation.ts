import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { getConversationsList } from "@/controllers/conversation";

const router = Router();

router.get("/", authenticate, getConversationsList);

export default router;
