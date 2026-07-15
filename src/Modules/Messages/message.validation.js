import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const sendMessageSchema = {
  body: joi.object({
    content: generalFields.content.required(),
  }),
  params: joi.object({
    receiverId: generalFields.id.required(),
  }),
};
