import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  create,
  createMessage,
  getConversationsList,
  getMessagesList,
  removeConversation,
  updateMessageReadStatus,
} from "@/controllers/conversation";
import {
  useGetConversationById,
  useSocket,
} from "@/controllers/conversation/middlewares";
import { remove } from "@/controllers/delivery";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.post("/", authenticate, create);
router.get(
  "/:id/messages",
  authenticate,
  useGetConversationById,
  getMessagesList
);
router.patch("/read/:id", authenticate, updateMessageReadStatus);
router.post(
  "/:id/messages",
  authenticate,
  useGetConversationById,
  createMessage
);
router.delete("/:id/messages", authenticate, useGetConversationById, remove);

export default router;
