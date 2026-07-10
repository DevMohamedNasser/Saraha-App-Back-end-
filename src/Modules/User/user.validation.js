import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: joi.ref("newPassword"),
  }),
};

export const freezeSchema = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const restoreSchema = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const DeleteAccSchema = {
  params: joi.object({
    userId: generalFields.id,
  }),
};
