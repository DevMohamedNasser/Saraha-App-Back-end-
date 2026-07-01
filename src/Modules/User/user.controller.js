import { Router } from "express";
import * as userService from "./user.service.js";
// import {
//   getProfile,
//   updateCoverPictures,
//   updateProfilePic,
// } from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware.js";
import { RoleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  fileValidation,
  localFileMulter,
} from "../../Utils/multer/local.multer.js";
import { validateFileMagicNum } from "../../Middlewares/fileValidation.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as userValidation from "./user.validation.js";

const router = Router();

router.get(
  "/profile",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  userService.getProfile,
);

router.patch(
  "/upload-file",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  localFileMulter({
    customPath: "users",
    validation: fileValidation.images,
  }).single("attachments"),
  validateFileMagicNum({ validation: fileValidation.images }),
  userService.updateProfilePic,
);

router.patch(
  "/upload-cover-images",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  localFileMulter({
    customPath: "users",
    validation: fileValidation.images,
  }).array("attachments", 5),
  validateFileMagicNum({ validation: fileValidation.images }),
  userService.updateCoverPictures,
);

router.patch(
  "/update-password",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

export default router;
