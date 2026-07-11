import cors from "cors";
import connectDB from "./DB/connection.js";
// import { userRouter, messageRouter, authRouter } from "./Modules/index.js";
import {
  globalErrorHandler,
  NOtFoundException,
} from "./Utils/Responses/error.response.js";
import { successResponse } from "./Utils/Responses/success.response.js";
import path from "node:path";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import helmet from "helmet";
import { attachRouterWithLogger } from "./Utils/loggers/morgan.logger.js";
import { routes } from "./Modules/routes.js";

const bootstrap = async (app, express) => {
  app.use(express.json(), cors(corsOptions()), helmet());

  // attachRouterWithLogger(app, "/api/v1/auth", authRouter, "auth.log");
  // attachRouterWithLogger(app, "/api/v1/user", userRouter, "user.log");
  routes.forEach(({ path, router, logFile }) =>
    attachRouterWithLogger(app, path, router, logFile),
  );

  await connectDB();

  app.get("/", (req, res) => {
    successResponse({
      statusCode: 201,
      res,
      message: "welcome ya handasa",
      data: { isAdmin: true },
    });
  });

  // run static files
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  // app.use("/api/v1/user", userRouter);
  // app.use("/api/v1/message", messageRouter);
  // app.use("/api/v1/auth", authRouter);
  routes.forEach(({ path, router }) => app.use(path, router));

  app.all("/*dummy", (req, res) => {
    throw NOtFoundException("Not found handler!!");
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
