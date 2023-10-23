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

createRoutes(app);

initDatabase()
  .then(() => {
    const server = http.createServer(app);

    const io = new Server(server, {
      serveClient: false,
    });

    io.on("connection", (socket) => {});

    server.listen(getEnv("port"));
  })
  .catch(closeApp);
