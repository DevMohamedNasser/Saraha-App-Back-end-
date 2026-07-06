import { v2 as cloudinary } from "cloudinary";
import {
  API_KEY,
  API_SECRET,
  CLOUD_NAME,
} from "../../../Config/config.service.js";
import multer from "multer";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// export const cloudFileMulter = ({ validation = [] }) => {
//   const storage = multer.memoryStorage();

//   const fileFilter = (req, file, cb) => {
//     if (!validation.includes(file.mimetype))
//       return cb(new Error("Invalid file type"));

//     return cb(null, true);
//   };

//   return multer({ storage, fileFilter });
// };

export default cloudinary;
