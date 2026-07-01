import cors from "cors";
import connectDB from "./DB/connection.js";
import { userRouter, messageRouter, authRouter } from "./Modules/index.js";
import {
  globalErrorHandler,
  NOtFoundException,
} from "./Utils/Responses/error.response.js";
import { successResponse } from "./Utils/Responses/success.response.js";
import path from "node:path";
// import { emailSubject, sendEmail } from "./Utils/email/email.utils.js";

const bootstrap = async (app, express) => {
  app.use(express.json(), cors());

  await connectDB();

  // await sendEmail({
  //   to: "strongerm631@gmail.com",
  //   subject: emailSubject.confirmEmail,
  //   // html: `<h1 style="color: #09c">welcome ya handasa from SarahaApp</h1>`,
  //   text: "894300"
  // });

  app.get("/", (req, res) => {
    // return res.status(200).json({ message: "welcome" });
    successResponse({
      statusCode: 201,
      res,
      message: "welcome ya handasa",
      data: { isAdmin: true },
    });
  });

  // run static files
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/auth", authRouter);

  app.all("/*dummy", (req, res) => {
    // return res.status(404).json({ message: "Not found handler!!!" });
    // successResponse({res, statusCode: 404, message: "Not found handler!!"});
    throw NOtFoundException("Not found handler!!");
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
