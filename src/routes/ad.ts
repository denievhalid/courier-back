import { Router } from "express";
import {
  create,
  getById,
  getDeliveredAds,
  getList,
  remove,
  update,
} from "@/controllers/ad";
import { authenticate } from "@/middlewares/authenticate";
import { getUser } from "@/middlewares/getUser";

const router = Router();

router.get("/", getUser, getList);
router.get("/delivered", authenticate, getDeliveredAds);
router.get("/:id", getUser, getById);
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

export default router;
