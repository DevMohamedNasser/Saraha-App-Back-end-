import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: joi.ref("newPassword"),
  }),
};
