import { Router } from "express";
import * as messageService from "./message.service.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as messageValidation from "./message.validation.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { tokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post(
  "/send-message/:receiverId",
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage,
);

router.get(
  "/",
  authentication({ tokenType: tokenTypeEnum.Access }),
  messageService.getMessages,
);

router.patch(
  "/:messageId/read",
  authentication({ tokenType: tokenTypeEnum.Access }),
  validation(messageValidation.toggleReadSchema),
  messageService.toggleRead,
);

router.patch(
  "/:messageId/fav",
  authentication({ tokenType: tokenTypeEnum.Access }),
  validation(messageValidation.toggleFavSchema),
  messageService.toggleFav
)

export default router;
