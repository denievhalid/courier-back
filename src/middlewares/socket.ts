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

  io.on(SocketEvents.CONNECTION, (socket) => {
    app.use((req, res, next) => {
      _.set(req, "io", socket);
      next();
    });

    socket.on(SocketEvents.JOIN_ROOM, socket.join);
    socket.on(SocketEvents.LEAVE_ROOM, socket.leave);
    socket.on(SocketEvents.TYPING, ({ room }: SocketJoinRoomType) => {
      socket.broadcast.to(room).emit(SocketEvents.TYPING);
    });
  });
};
