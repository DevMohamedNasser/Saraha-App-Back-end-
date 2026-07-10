import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware.js";
import { RoleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { localFileMulter } from "../../Utils/multer/local.multer.js";
import { validateFileMagicNum } from "../../Middlewares/fileValidation.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as userValidation from "./user.validation.js";
import { fileValidation } from "../../Utils/multer/fileTypes.validation.multer.js";

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
  "/upload-file-cloud",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  localFileMulter({
    customPath: "users",
    validation: fileValidation.images,
  }).single("attachments"),
  validateFileMagicNum({ validation: fileValidation.images }),
  userService.updateProfilePicCloud,
);

// router.patch(
//   "/upload-file-cloud",
//   authentication({ tokenType: tokenTypeEnum.Access }),
//   authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
//   cloudFileMulter({ validation: fileValidation.images }).single("attachments"),
//   validateFileMagicNumCloud({ validation: fileValidation.images }),
//   userService.updateProfilePicCloud,
// );

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

router.patch(
  "{/:userId}/freeze-acc",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(userValidation.freezeSchema),
  userService.freezeAcc,
);

router.patch(
  "{/:userId}/restore-acc",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(userValidation.restoreSchema),
  userService.restoreAccount,
);

router.patch(
  "/:userId/hard-delete-acc",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  validation(userValidation.DeleteAccSchema),
  userService.hardDeleteAcc,
);

router.get(
  "/share-profile",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  userService.shareProfile
);

export default router;
