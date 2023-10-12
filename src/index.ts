import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { getEnv } from "@/utils/env";
import { createRoutes } from "@/lib/createRoutes";
import { initDatabase } from "@/lib/database";
import { closeApp } from "@/utils/closeApp";
import { errorHandler } from "@/middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "35mb" }));
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "35mb",
    parameterLimit: 50000,
  })
);
app.use(errorHandler);

createRoutes(app);

initDatabase()
  .then(() => {
    app.listen(getEnv("port"));
  })
  .catch(closeApp);
