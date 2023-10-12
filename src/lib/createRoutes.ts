import adRoutes from "@/routes/ad";
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/user";
import { getEndpoint } from "@/utils/getEndpoint";
import type { Application } from "express";
import { errorHandler } from "@/middlewares/errorHandler";

export const createRoutes = (app: Application) => {
  app.use(getEndpoint("ads"), adRoutes);
  app.use(getEndpoint("auth"), authRoutes);
  app.use(getEndpoint("users"), userRoutes);
  app.use(errorHandler);
};
