import mongoose from "mongoose";
import { Schema } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum.js";
import { userPicDetails } from "../../Utils/constants/userPicture.model.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      minLength: [2, "minLength is 2"],
      maxLength: [25, "maxLength is 25"],
    },
    lastName: {
      type: String,
      required: [true, "firstName is required"],
      minLength: [2, "minLength is 2"],
      maxLength: [25, "maxLength is 25"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.SYSTEM;
      },
    },
    DOB: Date,
    phone: String,
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmail: Date,
    confirmEmailOTP: String,
    confirmEmailOTPExp: Date, // expires date
    forgetPasswordOTP: String,
    forgetPasswordOTPExp: Date,
    profilePic: String,
    coverPictures: [String],
    changeCredentialsTime: Date, // if user logout from all devices assign it
    profilePicCloud: {
      public_id: {
        type: String,
        default: function () {
          return this.gender == GenderEnum.MALE
            ? userPicDetails.publicIdMale
            : userPicDetails.publicIdFemale;
        },
      },
      secure_url: {
        type: String,
        default: function () {
          return this.gender == GenderEnum.MALE
            ? userPicDetails.secureUrlMale
            : userPicDetails.secureUrlFemale;
        },
      },
    },
    freezedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    freezedAt: Date,
    freezedByRole: {
      type: Number,
      enum: Object.values(RoleEnum),
    },
    restoredBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    restoredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// userSchema.virtual("userName").get(function () {
//   return this.firstName + " " + this.lastName;
// });

userSchema
  .virtual("userName")
  .set(function (values) {
    const [firstName, lastName] = values?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

const userModel = mongoose.model("User", userSchema);

export default userModel;
