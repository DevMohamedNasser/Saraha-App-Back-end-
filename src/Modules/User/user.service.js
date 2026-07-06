import jwt from "jsonwebtoken";
import { successResponse } from "../../Utils/Responses/success.response.js";
import {
  findById,
  findByIdAndUpdate,
  findOne,
  updateOne,
} from "../../DB/db.repo.js";
import userModel from "../../DB/Models/user.model.js";
import {
  BadRequestException,
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
import { GenderEnum } from "../../Utils/enums/user.enum.js";

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
