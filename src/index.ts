import express from "express";
import cors from "cors";
import { getEnv } from "@/utils/env";
import { createRoutes } from "@/lib/createRoutes";
import { initDatabase } from "@/lib/database";
import { closeApp } from "@/utils/closeApp";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

createRoutes(app);

initDatabase()
  .then(() => {
    app.listen(getEnv("port"));
  })
  .catch(closeApp);
