import { Router } from "express";
import { upload } from "@/controllers/file";
import multer from "@/lib/multer";

const router = Router();

router.post("/upload", multer.array("files"), upload);

export default router;
