import { Router } from "express";
import { create, getById, getList, remove, update } from "@/controllers/ad";
import { authenticate } from "@/middlewares/authenticate";
import { getUser } from "@/middlewares/getUser";

const router = Router();

router.get("/", getList);
router.get("/:id", getUser, getById);
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

export default router;
