import { Router } from "express";
import { create, remove, update, getByAdId } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";
import {
  useGetAdMiddleware,
  useSocket,
} from "@/controllers/delivery/middlewares";
import { useGetConversationById } from "@/controllers/conversation/middlewares";

const router = Router();

router.post(
  "/",
  authenticate,
  useGetAdMiddleware,
  useGetConversationById,
  create
);
router.get("/", authenticate, getByAdId);
router.patch("/", authenticate, update);
router.delete("/:ad", authenticate, useGetConversationById, remove);

export default router;
