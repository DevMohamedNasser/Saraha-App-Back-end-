import jwt from "jsonwebtoken";
import { successResponse } from "../../Utils/Responses/success.response.js";
import {
  deleteOne,
  findById,
  findByIdAndUpdate,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/db.repo.js";
import userModel from "../../DB/Models/user.model.js";
import {
  BadRequestException,
  ForbiddenException,
  NOtFoundException,
} from "../../Utils/Responses/error.response.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";
import { ACCESS_TOKEN_USER_SECRET } from "../../../Config/config.service.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import cloudinary from "../../Utils/multer/cloudinary.multer.js";
import { userPicDetails } from "../../Utils/constants/userPicture.model.js";
import { GenderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { user } = req;

  const isValidPassword = await compareHash({
    plainText: oldPassword,
    cipherText: user.password,
    algorithm: HashEnum.Bcrypt,
  });
  if (!isValidPassword) throw BadRequestException("Invalid password");

  const hashedPassword = await generateHash({
    plainText: newPassword,
    algorithm: HashEnum.Bcrypt,
  });

  await updateOne({
    model: userModel,
    filter: { _id: user._id },
    data: { password: hashedPassword },
  });

  // user.password = hashedPassword;
  // await user.save();

  successResponse({
    res,
    statusCode: 200,
    message: "Updated successfully",
  });
};

export const getProfile = async (req, res) => {
  const { user } = req;

  if (user.phone) user.phone = decrypt(user.phone);

  successResponse({ res, statusCode: 200, data: { user } });
};

export const updateProfilePic = async (req, res) => {
  // console.log(req.file);
  const user = await findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: { profilePic: req.file.finalPath },
  });
  successResponse({ res, statusCode: 200, message: "done", data: user });
};

export const updateProfilePicCloud = async (req, res) => {
  const { user } = req;
  const defaultSecureUrl =
    user.gender == GenderEnum.MALE
      ? userPicDetails.secureUrlMale
      : userPicDetails.secureUrlFemale;

  // remove old picture (not default one)
  // if (user.profilePicCloud.secure_url != defaultSecureUrl)
  //   await cloudinary.uploader.destroy(user.profilePicCloud.public_id);

  const defaultPublicId =
    user.gender == GenderEnum.MALE
      ? userPicDetails.publicIdMale
      : userPicDetails.publicIdFemale;
  const options = {};
  if (user.profilePicCloud.public_id == defaultPublicId)
    options.folder = `/users/${user._id}/profile-picture`;
  else options.public_id = user.profilePicCloud.public_id; // old & new file have same name => replace old one with new

  // upload file to cloud
  // console.log("req.file", req.file)
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    options,
  );
  if (!public_id || !secure_url)
    throw BadRequestException("Failed to upload profile picture");

  // save file to DB
  await updateOne({
    model: userModel,
    filter: { _id: user._id },
    data: {
      profilePicCloud: { public_id, secure_url },
    },
  });

  successResponse({ res, statusCode: 200, message: "done" });
};

export const updateCoverPictures = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: { coverPictures: req.files?.map((file) => file.finalPath) },
  });

  successResponse({ res, statusCode: 200, message: "done", data: user });
};

export const freezeAcc = async (req, res) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user._id;

  // console.log("decoded", req.decoded);
  // console.log("user", req.user);

  if (req.user.freezedAt) throw BadRequestException("Ur account is freezed");

  if (
    req.user._id.toString() !== targetUserId.toString() &&
    req.user.role !== RoleEnum.ADMIN
  )
    throw ForbiddenException("U are not admin or owning account");

  const updatedUser = await findOneAndUpdate({
    model: userModel,
    filter: { _id: targetUserId, freezedAt: { $exists: false } },
    data: {
      freezedBy: req.user._id,
      freezedAt: new Date(),
      freezedByRole: req.user.role,
      $unset: { restoredBy: true, restoredAt: true },
    },
  });

  if (!updatedUser)
    throw NOtFoundException("User not found or account already frozen");

  successResponse({
    res,
    statusCode: 200,
    message: "Account has been freezed",
    // data: updatedUser
  });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user._id;

  const targetUser = await findById({ model: userModel, id: targetUserId });
  if (!targetUser || !targetUser.freezedAt)
    throw NOtFoundException("User not found or account already active");

  if (targetUser.freezedByRole === RoleEnum.ADMIN)
    if (req.user.role !== RoleEnum.ADMIN)
      throw BadRequestException("Failed, only admin can restore it.");

  if (
    targetUserId.toString() !== req.user._id.toString() &&
    req.user.role !== RoleEnum.ADMIN
  )
    throw BadRequestException("U are not allowed to do this.");

  const updatedUser = await findByIdAndUpdate({
    model: userModel,
    id: targetUserId,
    data: {
      $unset: { freezedBy: true, freezedAt: true, freezedByRole: true },
      restoredBy: req.user._id,
      restoredAt: new Date(),
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Restored successfully",
    // data: updatedUser,
  });
};

export const hardDeleteAcc = async (req, res) => {
  const { userId } = req.params;

  const results = await deleteOne({
    model: userModel,
    filter: { _id: userId, role: RoleEnum.ADMIN },
  });

  if (!results.deletedCount) throw NOtFoundException("User not found.");

  successResponse({
    res,
    statusCode: 200,
    message: "Deleted successfully",
  });
};

export const shareProfile = async (req, res) => {
  const user = req.user;

  successResponse({
    res,
    statusCode: 200,
    message: "done",
    data: {
      id: user._id,
      userName: user.userName,
      profilePic: user.profilePicCloud.secure_url,
      email: user.email,
      phone: decrypt(user.phone),
      gender: user.gender === GenderEnum.MALE ? "Male" : "Female",
    },
  });
};
