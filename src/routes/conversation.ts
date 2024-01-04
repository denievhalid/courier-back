import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  createConversation,
  createMessage,
  getConversationsList,
  getMessagesList,
  removeConversation,
  updateMessageReadStatus,
} from "@/controllers/conversation";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.post("/", authenticate, createConversation);
router.get("/:id/messages", authenticate, getMessagesList);
router.patch("/read/:id", authenticate, updateMessageReadStatus);
router.post("/:id/messages", authenticate, createMessage);
router.delete("/:id/messages", authenticate, removeConversation);

export default router;
