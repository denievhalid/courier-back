import multer from "multer";
import * as process from "process";

const UPLOADS_FOLDER = `${process.cwd()}/src/uploads`;

const storage = multer.diskStorage({
  destination: function (
    _,
    __,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (
    req,
    file,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, Date.now() + " - " + file.originalname);
  },
});

export default multer({ storage });
