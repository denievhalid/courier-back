import adRoutes from "@/routes/ad";
import authRoutes from "@/routes/auth";
import conversationRoutes from "@/routes/conversation";
import deliveryRoutes from "@/routes/delivery";
import directionRoutes from "@/routes/direction";
import favoriteRoutes from "@/routes/favorite";
import fileRoutes from "@/routes/file";
import messageRoutes from "@/routes/message";
import userRoutes from "@/routes/user";
import { getEndpoint } from "@/utils/getEndpoint";
import { errorHandler } from "@/middlewares/errorHandler";
import type { Application } from "express";

export const createRoutes = (app: Application) => {
  app.use(getEndpoint("ads"), adRoutes);
  app.use(getEndpoint("conversations"), conversationRoutes);
  app.use(getEndpoint("deliveries"), deliveryRoutes);
  app.use(getEndpoint("directions"), directionRoutes);
  app.use(getEndpoint("favorites"), favoriteRoutes);
  app.use(getEndpoint("files"), fileRoutes);
  app.use(getEndpoint("messages"), messageRoutes);
  app.use(getEndpoint("auth"), authRoutes);
  app.use(getEndpoint("users"), userRoutes);
  app.use(errorHandler);
};
