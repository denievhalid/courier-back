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
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  });

  io.on(SocketEvents.CONNECTION, (socket) => {
    console.log("connect");
    socket.on(SocketEvents.JOIN_ROOM, ({ room }: SocketJoinRoomType) => {
      console.log("join room");
      socket.join(room);
    });
    socket.on(SocketEvents.LEAVE_ROOM, ({ room }: SocketJoinRoomType) => {
      socket.leave(room);
    });
    socket.on(SocketEvents.TYPING, ({ room }: SocketJoinRoomType) => {
      socket.broadcast.to(room).emit(SocketEvents.TYPING);
    });

    socket.on(SocketEvents.DISCONNECT, () => {});
  });

  app.use((req, res, next) => {
    _.set(req, "io", io);
    next();
  });
};

export const getRoomName = (room: string) => {};

export { io as socket };
