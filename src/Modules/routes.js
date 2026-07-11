import { authRouter, messageRouter, userRouter } from "../Modules/index.js";

export const routes = [
  {
    path: "/api/v1/user",
    router: userRouter,
    logFile: "user.log",
  },
  {
    path: "/api/v1/auth",
    router: authRouter,
    logFile: "auth.log",
  },
  {
    path: "/api/v1/message",
    router: messageRouter,
    logFile: "message.log",
  },
];
