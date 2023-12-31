import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  create,
  createMessage,
  getConversationsList,
  getMessagesList,
  removeConversation,
} from "@/controllers/conversation";
import {
  useGetConversationById,
  useSocket,
} from "@/controllers/conversation/middlewares";

const router = Router();

router.get("/", authenticate, getConversationsList);
router.post("/", authenticate, create);
router.get(
  "/:id/messages",
  authenticate,
  useGetConversationById,
  getMessagesList
);
router.post(
  "/:id/messages",
  authenticate,
  useGetConversationById,
  createMessage,
  useSocket
);
router.delete(
  "/:id/messages",
  authenticate,
  useGetConversationById,
  removeConversation
);

export default router;
