import { OAuth2Client } from "google-auth-library";

import { CLIENT_ID } from "../../../Config/config.service.js";
import { create, findOne } from "../../DB/db.repo.js";
import userModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
  NOtFoundException,
  UnauthorizedException,
} from "../../Utils/Responses/error.response.js";
import { successResponse } from "../../Utils/Responses/success.response.js";
import { decrypt, encrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";

import {
  generateToken,
  getNewLoginCredentials,
} from "../../Utils/Tokens/token.js";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum.js";

export const signup = async (req, res) => {
  const { userName, email, password, phone } = req.body;

  // const validationRes = signupSchema.validate(req.body, { abortEarly: false });
  // if (validationRes.error)
  //   throw BadRequestException("Validation Error", validationRes.error.details);

  if (await findOne({ model: userModel, filter: { email } }))
    throw ConflictException("User already exists");

  const hashedPassword = await generateHash({
    plainText: password,
    algorithm: HashEnum.Bcrypt,
  });

  const encryptedPhone = encrypt(phone);

  const user = await create({
    model: userModel,
    data: [
      { userName, email, password: hashedPassword, phone: encryptedPhone },
    ],
  });
  successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: userModel,
    filter: { email },
    // select: "userName email firstName lastName",
  });
  if (!user) throw NOtFoundException("User not found");

  const isMatch = await compareHash({
    plainText: password,
    cipherText: user.password,
    algorithm: HashEnum.Bcrypt,
  });
  if (!isMatch) throw UnauthorizedException("email or password is not correct");

  // if (user.phone) user.phone = decrypt(user.phone);

  // const token = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
  //   expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  //   audience: ["web", "mobile"],
  //   issuer: "SarahaApp",
  //   subject: "User Authentication",
  // });

  const tokens = await getNewLoginCredentials(user);

  successResponse({
    res,
    statusCode: 200,
    message: "Logged in successfully",
    data: { tokens },
  });
};

export const refreshToken = async (req, res) => {
  const { user } = req;

  const tokens = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "done",
    data: { accessToken: tokens.accessToken },
  });
};

async function verifyGoogleAccount(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID, // Specify the WEB_CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  return payload;
}

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  // const payload = await verifyGoogleAccount(idToken);
  // console.log("payload", payload);
  const {
    email,
    email_verified,
    given_name: firstName,
    family_name: lastName,
    picture,
  } = await verifyGoogleAccount(idToken);

  if (!email_verified) throw BadRequestException("email not verified");

  const user = await findOne({ model: userModel, filter: { email } });

  if (user) {
    if (user.provider == ProviderEnum.GOOGLE) {
      const tokens = await getNewLoginCredentials(user);
      successResponse({
        res,
        statusCode: 200,
        message: "Login Successfully",
        data: tokens,
      });
    }
  } else {
    // if user not found create him
    const newUser = await create({
      model: userModel,
      data: [
        {
          email,
          firstName,
          lastName,
          profilePic: picture,
          provider: ProviderEnum.GOOGLE,
        },
      ],
    });
    const tokens = await getNewLoginCredentials(newUser);
    successResponse({
      res,
      statusCode: 201,
      message: "SignUp & Login Successfully",
      data: tokens,
    });
  }
};
