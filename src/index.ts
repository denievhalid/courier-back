import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { getEnv } from "@/utils/env";
import { Server } from "socket.io";
const http = require("http");
import { createRoutes } from "@/lib/createRoutes";
import { initDatabase } from "@/lib/database";
import { closeApp } from "@/utils/closeApp";
import { extractToken } from "@/middlewares/extractToken";
import _ from "lodash";
import { SOCKET_EVENTS } from "@/const";
const session = require("express-session");

const app = express();

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(extractToken);

initDatabase()
  .then(() => {
    const server = http.createServer(app);

    const io = new Server(server, {
      serveClient: false,
    });

    app.use((req, res, next) => {
      _.set(req, "io", io);
      next();
    });
    const sessionMiddleware = session({
      secret: "courierSecret123",
      resave: true,
      saveUninitialized: true,
    });

    app.use(sessionMiddleware);

    createRoutes(app);
    io.engine.use(sessionMiddleware);

    io.on("connection", (socket) => {
      // @ts-ignore
      const sessionId = socket.request.session.id;
      socket.join(sessionId);

      socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ room }: { room: string }) => {
        socket.join(room);
      });
      socket.on(SOCKET_EVENTS.LEAVE_ROOM, ({ room }: { room: string }) => {
        socket.leave(room);
      });
    });

    server.listen(getEnv("port"));
  })
  .catch(closeApp);
