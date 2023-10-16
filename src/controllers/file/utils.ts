import { Multer } from "multer";
import _ from "lodash";
import { UPLOADS_FOLDER } from "@/lib/multer";

export const getUploadPayload = (files: Express.Multer.File[]) => {
  return _.map(files, (file) => ({
    uri: `https://findcourier.ru/${UPLOADS_FOLDER}/${file.filename}`,
  }));
};
