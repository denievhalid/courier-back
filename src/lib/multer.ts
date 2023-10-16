import multer from "multer";
import * as process from "process";
import { normalizeFileName } from "@/utils/normalizeFileName";

export const UPLOADS_FOLDER = `${process.cwd()}/uploads`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, normalizeFileName(file));
  },
});

export default multer({ storage });
