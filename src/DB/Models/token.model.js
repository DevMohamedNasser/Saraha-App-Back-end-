import mongoose from "mongoose";
import { Schema } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum.js";

const tokenSchema = new Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL (Time To Live)
tokenSchema.index("expiresIn", { expireAfterSeconds: 0 }); // delete document may causes delay from mongoDb

const tokenModel = mongoose.model("Token", tokenSchema);

export default tokenModel;
