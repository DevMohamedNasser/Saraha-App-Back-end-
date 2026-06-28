import { Router } from "express";
import { login, googleLogin, refreshToken, signup } from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as authValidation from "./auth.validation.js";

const router = Router();

router.post("/signup", validation(authValidation.signupSchema), signup);
router.post("/login", validation(authValidation.loginSchema), login);

router.post(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.Refresh }),
  refreshToken,
);

router.post("/social-login", googleLogin);

export default router;
