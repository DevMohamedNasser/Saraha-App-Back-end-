import { findById, findOne } from "../DB/db.repo.js";
import tokenModel from "../DB/Models/token.model.js";
import userModel from "../DB/Models/user.model.js";
import { SignatureEnum, tokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  ForbiddenException,
  NOtFoundException,
  UnauthorizedException,
} from "../Utils/Responses/error.response.js";
import { getSignature, verifyToken } from "../Utils/Tokens/token.js";

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization.split(" ") || [];

  let signature = await getSignature({
    signatureLevel:
      Bearer === "ADMIN"
        ? SignatureEnum.Admin
        : Bearer === "USER"
          ? SignatureEnum.User
          : new Error("Invalid signature"),
  });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType == tokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  // check if token is revoked (logout only me)
  if (await findOne({ model: tokenModel, filter: { jti: decoded.jwtId } }))
    throw UnauthorizedException("Token is revoked. plz login");

  const user = await findById({ model: userModel, id: decoded.id });
  if (!user) throw NOtFoundException("User not found");

  // console.log(user.changeCredentialsTime?.getTime(), decoded.iat); // 13 digits, 10 digits
  if ((user.changeCredentialsTime?.getTime() || 0) >= decoded.iat * 1000)
    throw UnauthorizedException("Token not valid. plz login");

  return { user, decoded };
};

// Auth middleware
export const authentication = ({ tokenType = tokenTypeEnum.Access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] }) => {
  return async (req, res, next) => {
    // console.log(req.user)
    if (!accessRoles.includes(req.user.role))
      throw ForbiddenException("Unauthorized access");

    return next();
  };
};
