import { v4 as uuid } from "uuid";
import path from "path";

export const normalizeFileName = (file: { originalname: string }) => {
  return `${uuid()}${path.extname(file?.originalname)}`;
};
