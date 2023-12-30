import { Server } from "socket.io";
import _ from "lodash";
import { SocketEvents } from "@/const";
import { Application } from "express";
import type { Server as HttpServer } from "http";

type SocketJoinRoomType = {
  room: string;
};

export const initSocket = (app: Application, server: HttpServer) => {
  const io = new Server(server, {
    serveClient: false,
  });

  app.use((req, res, next) => {
    _.set(req, "io", io);
    return next();
  });

  io.on(SocketEvents.CONNECTION, (socket) => {
    socket.on(SocketEvents.JOIN_ROOM, socket.join);
    socket.on(SocketEvents.LEAVE_ROOM, socket.leave);
    socket.on(SocketEvents.TYPING, ({ room }: SocketJoinRoomType) => {
      socket.broadcast.to(room).emit(SocketEvents.TYPING);
    });
  });
};
