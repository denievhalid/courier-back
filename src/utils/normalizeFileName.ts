import { v4 as uuid } from "uuid";
import path from "path";
import type { Express } from "express";

export const normalizeFileName = (file: { originalname: string }) => {
  return `${uuid()}${path.extname(file?.originalname)}`;
};
