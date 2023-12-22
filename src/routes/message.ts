import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import {
  create,
  getList,
  update,
  updateMessageReadStatus,
} from "@/controllers/message";

const router = Router();

router.get("/:conversation", authenticate, getList);
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);
router.patch("/read/:id", authenticate, updateMessageReadStatus);

export default router;
