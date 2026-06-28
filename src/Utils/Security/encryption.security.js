import crypto from "node:crypto";
import { ENC_KEY } from "../../../Config/config.service.js";

// aes-256-cbc => 256/8 = 32 bytes
// aes-512-cbc => 512/8 = 64 bytes
// aes-256-cbc => 128/8 = 16 bytes

const IV_LENGTH = 16;
const ENCRYPTION_KEY_SECRET = Buffer.from(ENC_KEY); // Must be 32 bytes

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_SECRET,
    iv,
  );

  let encryptedData = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`; // return iv : encryptedData
};

export const decrypt = (encryptedData) => {
  const [ivHex, encryptedText] = encryptedData.split(":");

  const binaryLikeIv = Buffer.from(ivHex, "hex"); // convert iv string to original hex

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_SECRET,
    binaryLikeIv,
  );

  let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
