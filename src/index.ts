import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { getEnv } from "@/utils/env";
import { createRoutes } from "@/lib/createRoutes";
import { initDatabase } from "@/lib/database";
import { closeApp } from "@/utils/closeApp";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json({ limit: "35mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "35mb",
    parameterLimit: 50000,
  })
);

createRoutes(app);

initDatabase()
  .then(() => {
    app.listen(getEnv("port"));
  })
  .catch(closeApp);
