import { Router } from "express";
import * as messageService from "./message.service.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as messageValidation from "./message.validation.js";

const router = Router();

router.post(
  "/send-message/:receiverId",
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage,
);

export default router;
