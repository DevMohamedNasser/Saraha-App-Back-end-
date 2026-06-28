import bcrypt from "bcrypt";
import argon2 from "argon2";
import { SALT_ROUNDS } from "../../../Config/config.service.js";
import { HashEnum } from "../enums/security.enum.js";
import { BadRequestException } from "../Responses/error.response.js";

export const generateHash = async ({
  plainText,
  saltRounds = SALT_ROUNDS,
  algorithm = HashEnum.Bcrypt,
}) => {
  let hashResult = "";
  switch (algorithm) {
    case HashEnum.Bcrypt:
      hashResult = await bcrypt.hash(plainText, saltRounds);
      break;
    case HashEnum.Argon2:
      hashResult = await argon2.hash(plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return hashResult;
};

export const compareHash = async ({
  plainText,
  cipherText,
  algorithm = HashEnum.Bcrypt,
}) => {
  let isMatch = false;

  switch (algorithm) {
    case HashEnum.Bcrypt:
      isMatch = await bcrypt.compare(plainText, cipherText);
      break;
    case HashEnum.Argon2:
      isMatch = await argon2.verify(cipherText, plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }

  return isMatch;
};
