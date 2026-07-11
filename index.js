import express from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./Config/config.service.js";
import chalk from "chalk";

const port = PORT || 80;

const app = express();
await bootstrap(app, express);

app.listen(3000, () => {
  console.log(chalk.bgGreen(`Server has been run on http://127.0.0.1:${port}`));
});
