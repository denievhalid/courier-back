import adRoutes from "@/routes/ad";
import blockRoutes from "@/routes/block";
import authRoutes from "@/routes/auth";
import conversationRoutes from "@/routes/conversation";
import deliveryRoutes from "@/routes/delivery";
import directionRoutes from "@/routes/direction";
import favoriteRoutes from "@/routes/favorite";
import fileRoutes from "@/routes/file";
import userRoutes from "@/routes/user";
import { getEndpoint } from "@/utils/getEndpoint";
import { errorHandler } from "@/middlewares/errorHandler";
import { Routes } from "@/types";
import type { Application } from "express";

export const createRoutes = (app: Application) => {
  app.use(getEndpoint(Routes.ADS), adRoutes);
  app.use(getEndpoint(Routes.AUTH), authRoutes);
  app.use(getEndpoint(Routes.BLOCKS), blockRoutes);
  app.use(getEndpoint(Routes.CONVERSATIONS), conversationRoutes);
  app.use(getEndpoint(Routes.DELIVERIES), deliveryRoutes);
  app.use(getEndpoint(Routes.DIRECTIONS), directionRoutes);
  app.use(getEndpoint(Routes.FAVORITES), favoriteRoutes);
  app.use(getEndpoint(Routes.FILES), fileRoutes);
  app.use(getEndpoint(Routes.USERS), userRoutes);
  app.use(errorHandler);
};
