import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  create,
  createMessage,
  getConversationsList,
  getMessagesList,
  removeConversation,
} from "@/controllers/conversation";
import { getConversationById } from "@/controllers/conversation/middlewares";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.post("/", authenticate, create);

router.get("/:id/messages", authenticate, getConversationById, getMessagesList);
router.post("/:id/messages", authenticate, getConversationById, createMessage);
router.delete(
  "/:id/messages",
  authenticate,
  getConversationById,
  removeConversation
);

export default router;
