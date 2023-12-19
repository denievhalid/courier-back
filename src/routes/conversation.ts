import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  create,
  createMessage,
  getConversationsList,
  getMessagesList,
} from "@/controllers/conversation";
import { getConversationById } from "@/controllers/conversation/middlewares";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.get("/:id/messages", authenticate, getConversationById, getMessagesList);
router.post("/", authenticate, create);
router.post("/:id/messages", authenticate, getConversationById, createMessage);

export default router;
