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

  console.log("123123");

  io.on(SocketEvents.CONNECTION, (socket) => {
    console.log("socket");
    socket.on(SocketEvents.JOIN_ROOM, ({ room }: SocketJoinRoomType) => {
      console.log(room, "room");
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
