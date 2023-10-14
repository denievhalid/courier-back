import adRoutes from "@/routes/ad";
import authRoutes from "@/routes/auth";
import dialogRoutes from "@/routes/dialog";
import messageRoutes from "@/routes/message";
import userRoutes from "@/routes/user";
import { getEndpoint } from "@/utils/getEndpoint";
import type { Application } from "express";
import { errorHandler } from "@/middlewares/errorHandler";

export const createRoutes = (app: Application) => {
  app.use(getEndpoint("ads"), adRoutes);
  app.use(getEndpoint("dialogs"), dialogRoutes);
  app.use(getEndpoint("messages"), messageRoutes);
  app.use(getEndpoint("auth"), authRoutes);
  app.use(getEndpoint("users"), userRoutes);
  app.use(errorHandler);
};
