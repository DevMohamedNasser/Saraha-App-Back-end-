import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ACCESS_TOKEN_ADMIN_SECRET,
  ACCESS_TOKEN_USER_EXPIRES_IN,
  ACCESS_TOKEN_USER_SECRET,
  REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  REFRESH_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_USER_EXPIRES_IN,
  REFRESH_TOKEN_USER_SECRET,
} from "../../../Config/config.service.js";
import { RoleEnum, SignatureEnum } from "../enums/user.enum.js";

export const generateToken = ({ payload, secretKey, options }) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = SignatureEnum.User }) => {
  let signature = {
    accessSignature: undefined,
    refreshSignature: undefined,
  };

  switch (signatureLevel) {
    case SignatureEnum.Admin:
      signature.accessSignature = ACCESS_TOKEN_ADMIN_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_ADMIN_SECRET;
      break;
    default:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const signature = getSignature({
    signatureLevel:
      user.role == RoleEnum.ADMIN ? SignatureEnum.Admin : SignatureEnum.User,
  });

  const jwtId = uuidv4();
  const accessToken = generateToken({
    payload: { id: user._id, jwtId },
    secretKey: signature.accessSignature,
    options: {
      expiresIn:
        user.role == RoleEnum.USER
          ? ACCESS_TOKEN_USER_EXPIRES_IN
          : ACCESS_TOKEN_ADMIN_EXPIRES_IN,
    },
  });
  const refreshToken = generateToken({
    payload: { id: user._id, jwtId },
    secretKey: signature.refreshSignature,
    options: {
      expiresIn:
        user.role == RoleEnum.USER
          ? REFRESH_TOKEN_USER_EXPIRES_IN
          : REFRESH_TOKEN_ADMIN_EXPIRES_IN,
    },
  });

  return { accessToken, refreshToken };
};
