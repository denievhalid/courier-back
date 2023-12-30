import { Router } from "express";
import { create, remove, update, getByAdId } from "@/controllers/delivery";
import { authenticate } from "@/middlewares/authenticate";
import {
  useGetAdMiddleware,
  useSocket,
} from "@/controllers/delivery/middlewares";
import { getConversationById } from "@/controllers/conversation/middlewares";

const router = Router();

router.post("/", authenticate, useGetAdMiddleware, create, useSocket);
router.get("/", authenticate, getByAdId);
router.patch("/", authenticate, update);
router.delete("/:ad", authenticate, getConversationById, remove);

export default router;
