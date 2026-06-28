import jwt from "jsonwebtoken";
import { successResponse } from "../../Utils/Responses/success.response.js";
import { findById, findByIdAndUpdate, updateOne } from "../../DB/db.repo.js";
import userModel from "../../DB/Models/user.model.js";
import { NOtFoundException } from "../../Utils/Responses/error.response.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";
import { ACCESS_TOKEN_USER_SECRET } from "../../../Config/config.service.js";

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

export const updateCoverPictures = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: { coverPictures: req.files?.map( file => file.finalPath ) }
  })

  successResponse({res, statusCode: 200, message: "done", data: user});
}