import { Server } from "socket.io";
import _ from "lodash";
import { SocketEvents } from "@/const";
import { Application } from "express";
import type { Server as HttpServer } from "http";

let io: Server;

type SocketJoinRoomType = {
  room: string;
};

export const initSocket = (app: Application, server: HttpServer) => {
  io = new Server(server, {
    serveClient: false,
  });

  io.on(SocketEvents.CONNECTION, (socket) => {
    socket.on(SocketEvents.JOIN_ROOM, ({ room }: SocketJoinRoomType) => {
      socket.join(room);
    });
    socket.on(SocketEvents.LEAVE_ROOM, socket.leave);
    socket.on(SocketEvents.TYPING, ({ room }: SocketJoinRoomType) => {
      socket.broadcast.to(room).emit(SocketEvents.TYPING);
    });
  });

  app.use((req, res, next) => {
    _.set(req, "io", io);
    next();
  });
};

export const getRoomName = (room: string) => {};

export { io as socket };
