import mongoose from "mongoose";
import joi from "joi";
import { BadRequestException } from "../Utils/Responses/error.response.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../Utils/enums/user.enum.js";

export const generalFields = {
  userName: joi.string().min(2).max(50).messages({
    "any.required": "userName is required",
    "string.min": "userName must be at least 2 characters long",
    "string.max": "userName must be at most 25 characters long",
  }),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 5,
      tlds: { allow: ["com", "net", "org", "edu"] },
    }),
  password: joi.string(),
  confirmPassword: joi.ref("password"),
  phone: joi
    .string()
    .pattern(/^(\+20|020|0)?1[0125][0-9]{8}$/)
    .message({ "string.pattern.base": "Invalid phone number format" }),
  id: joi.string().custom((value, helper) => {
    return (
      mongoose.Types.ObjectId.isValid(value) ||
      helper.message("Invalid ObjectId format")
    );
  }),
  otp: joi.string().pattern(/^\d{6}$/),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  role: joi.string().valid(...Object.values(RoleEnum)),
  provider: joi.string().valid(...Object.values(ProviderEnum)),
  confirmEmail: joi.string().isoDate(),
  DOB: joi.string().isoDate(),
  profilePic: joi.string(),
  coverPictures: joi.array().items(joi.string()),
};

export const validation = (schema) => {
  // schema like { body, headers, params, query }
  return (req, res, next) => {
    const validationError = [];

    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResults.error)
        validationError.push({ key, details: validationResults.error.details });
    }

    if (validationError.length)
      throw BadRequestException("Validation Error", validationError);

    return next();
  };
};
