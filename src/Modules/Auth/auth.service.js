import { OAuth2Client } from "google-auth-library";

import {
  ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ACCESS_TOKEN_USER_EXPIRES_IN,
  CLIENT_ID,
} from "../../../Config/config.service.js";
import {
  create,
  findByIdAndUpdate,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/db.repo.js";
import userModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
  NOtFoundException,
  UnauthorizedException,
} from "../../Utils/Responses/error.response.js";
import { successResponse } from "../../Utils/Responses/success.response.js";
import { encrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";

import { getNewLoginCredentials } from "../../Utils/Tokens/token.js";
import {
  LogoutTypeEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum.js";
import tokenModel from "../../DB/Models/token.model.js";
import { generateOTP } from "../../Utils/email/generateOTP.utils.js";
import { emailEvents } from "../../Utils/events/email.events.js";
import { revokeTokenKey, set } from "../../DB/redis.repo.js";

export const signup = async (req, res) => {
  const { userName, email, password, phone, gender } = req.body;

  // const validationRes = signupSchema.validate(req.body, { abortEarly: false });
  // if (validationRes.error)
  //   throw BadRequestException("Validation Error", validationRes.error.details);

  if (await findOne({ model: userModel, filter: { email } }))
    throw ConflictException("User already exists");

  const otp = generateOTP();
  const otpHashed = await generateHash({
    plainText: otp,
    algorithm: HashEnum.Bcrypt,
  });

  const hashedPassword = await generateHash({
    plainText: password,
    algorithm: HashEnum.Bcrypt,
  });

  const encryptedPhone = encrypt(phone);

  const user = await create({
    model: userModel,
    data: [
      {
        userName,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        gender,
        confirmEmailOTP: otpHashed,
        confirmEmailOTPExp: Date.now() + 5 * 1000 * 60, // From ms then sec to minutes
      },
    ],
  });

  emailEvents.emit("confirmEmail", { to: email, otp, userName });

  successResponse({
    res,
    statusCode: 201,
    message: "Check ur inbox (open Gmail and send OTP)",
    data: user,
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      confirmEmailOTP: { $exists: true },
      confirmEmail: { $exists: false },
    },
  });
  if (!user) throw NOtFoundException("User not found");

  if (user.confirmEmailOTPExp < Date.now()) {
    throw BadRequestException("OTP has expired.");
  }

  const isMatch = await compareHash({
    plainText: otp,
    cipherText: user.confirmEmailOTP,
    algorithm: HashEnum.Bcrypt,
  });
  if (!isMatch) throw BadRequestException("Invalid OTP");

  await updateOne({
    model: userModel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOTP: true, confirmEmailOTPExp: true },
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "User confirmed successfully",
  });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: false } },
  });
  if (!user) throw NOtFoundException("User not found");

  if (new Date(user.confirmEmailOTPExp) - 3 * 1000 * 60 > Date.now())
    throw BadRequestException(
      "Can't resend OTP before 2min of creation. Try later.",
    );

  const otp = generateOTP();
  const otpHashed = await generateHash({
    plainText: otp,
    algorithm: HashEnum.Bcrypt,
  });
  user.confirmEmailOTP = otpHashed;
  user.confirmEmailOTPExp = Date.now() + 5 * 1000 * 60; // From ms then sec to minutes;
  await user.save();

  emailEvents.emit("confirmEmail", { to: email, otp, userName: user.userName });

  successResponse({ res, statusCode: 200, message: "Check ur inbox (Gmail)" });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  const otpHashed = await generateHash({
    plainText: otp,
    algorithm: HashEnum.Bcrypt,
  });

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    },
  });
  if (!user) throw NOtFoundException("User not found");

  if (new Date(user.forgetPasswordOTPExp) - 4 * 1000 * 60 > Date.now())
    throw BadRequestException("Can't resend OTP before 1min of creation.");

  // await updateOne({
  //   model: userModel,
  //   filter: {email},
  //   data: {
  //     forgetPasswordOTP: otpHashed,
  //     forgetPasswordOTPExp: Date.now() + 5 * 1000 * 60,
  //   },
  // });
  user.forgetPasswordOTP = otpHashed;
  user.forgetPasswordOTPExp = Date.now() + 5 * 1000 * 60;
  await user.save();

  emailEvents.emit("forgetPassword", {
    to: email,
    otp,
    userName: user.firstName,
  });

  successResponse({ res, statusCode: 200, message: "Check ur inbox (Gmail)" });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });
  if (!user) throw NOtFoundException("User not found");
  if (user.forgetPasswordOTPExp < Date.now())
    throw BadRequestException("OTP has expired");

  const isValidOtp = await compareHash({
    plainText: otp,
    cipherText: user.forgetPasswordOTP,
    algorithm: HashEnum.Bcrypt,
  });
  if (!isValidOtp) throw BadRequestException("Invalid OTP");

  const hashedNewPassword = await generateHash({
    plainText: newPassword,
    algorithm: HashEnum.Bcrypt,
  });

  await updateOne({
    model: userModel,
    filter: { email },
    data: {
      password: hashedNewPassword,
      $unset: { forgetPasswordOTP: true, forgetPasswordOTPExp: true },
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Password reset successfully",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: userModel,
    // filter: { email, confirmEmail: { $exists: true } },
    filter: { email },
    // select: "userName email firstName lastName",
  });
  if (!user) throw NOtFoundException("User not found");
  if (!user.confirmEmail) throw BadRequestException("Email not confirmed");

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

export const logout = async (req, res) => {
  // log out from all devices || only me
  const { flag } = req.body;
  if (flag != LogoutTypeEnum.AllDevices && flag != LogoutTypeEnum.OnlyMe)
    return BadRequestException(
      `flag must be 1 [ ${Object.values(LogoutTypeEnum)} ]`,
    );

  let status = 200;
  switch (flag) {
    case LogoutTypeEnum.OnlyMe:
      // create document in token model
      await create({
        model: tokenModel,
        data: [
          {
            jti: req.decoded.jwtId,
            userId: req.decoded.id,
            expiresIn: new Date(req.decoded.exp * 1000),
          },
        ],
      });
      status = 201;
      break;
    case LogoutTypeEnum.AllDevices:
      await findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
          changeCredentialsTime: Date.now(),
        },
      });
      status = 200;
      break;
  }

  return successResponse({
    res,
    statusCode: status,
    message: "Logout successfully",
  });
};

export const logoutWithRedis = async (req, res) => {
  const { user, decoded } = req;
  await set({
    key: revokeTokenKey({ userId: user._id, jti: decoded.jti }),
    value: decoded.jti,
    ttl:
      decoded.iat +
      (user.role == RoleEnum.USER
        ? ACCESS_TOKEN_USER_EXPIRES_IN
        : ACCESS_TOKEN_ADMIN_EXPIRES_IN),
  });

  console.log({
    ttl:
      decoded.iat + user.role == RoleEnum.USER
        ? ACCESS_TOKEN_USER_EXPIRES_IN
        : ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  });
  console.log(ACCESS_TOKEN_USER_EXPIRES_IN);
  console.log(decoded.iat + ACCESS_TOKEN_USER_EXPIRES_IN);
  console.log(decoded.iat);

  successResponse({
    res,
    statusCode: 200,
    message: "Logout successfully",
  });
};
