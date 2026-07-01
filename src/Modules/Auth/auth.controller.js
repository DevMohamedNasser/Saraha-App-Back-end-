import { Router } from "express";
// import { login, googleLogin, refreshToken, signup } from "./auth.service.js";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as authValidation from "./auth.validation.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup,
);
router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);
router.patch(
  "/resend-otp",
  validation(authValidation.resendOTPSchema),
  authService.resendOTP,
);
router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);
router.patch(
  "/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword,
);
router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.Refresh }),
  authService.refreshToken,
);

router.post("/social-login", authService.googleLogin);
router.post(
  "/logout",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authService.logout,
);

export default router;
