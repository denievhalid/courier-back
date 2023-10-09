import { Application } from "express";
import adRoutes from "@/routes/ad";
import userRoutes from "@/routes/user";
import { getEndpoint } from "@/utils/getEndpoint";

export const createRoutes = (app: Application) => {
  app.use(getEndpoint("ads"), adRoutes);
  app.use(getEndpoint("users"), userRoutes);
};
