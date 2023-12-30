import * as http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { getEnv } from "@/utils/env";
import { createRoutes } from "@/lib/createRoutes";
import { initDatabase } from "@/lib/database";
import { closeApp } from "@/utils/closeApp";
import { extractToken } from "@/middlewares/extractToken";
import { Env } from "@/const";
import { initSocket } from "@/middlewares/socket";

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

    createRoutes(app);
    initSocket(app, server);

    server.listen(getEnv(Env.PORT));
  })
  .catch(closeApp);
