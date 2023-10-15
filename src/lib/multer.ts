import multer from "multer";
import * as process from "process";

const UPLOADS_FOLDER = `${process.cwd()}/src/uploads`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + " - " + file.originalname);
  },
});

export default multer({ storage });
