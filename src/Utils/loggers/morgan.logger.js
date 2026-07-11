import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

const __dirname = path.resolve(); // absolute path (mohamednasser@Mohamed-RNasser sarahaApp (back-end))

export const attachRouterWithLogger = (
  app,
  routerPath,
  router,
  logFileName,
) => {
  const logStream = fs.createWriteStream(
    path.resolve(__dirname, "./src/loggers", logFileName),
    {
      flags: "a", // act as append (not overwrite on file)
    },
  );

  app.use(
    routerPath,
    morgan("common", { stream: logStream }),
    morgan("dev"),
    router,
  );
};
