import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const signupSchema = {
  body: joi.object({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
    phone: generalFields.phone,
    gender: generalFields.gender,
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};
