import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileValidation = {
  images: [
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ],
  videos: ["video/mp4", "video/webm", "video/x-matroska"],
  audios: [
    "audio/aiff",
    "audio/mp4",
    "audio/mp4a-latm",
    "audio/mpeg",
    "audio/webm",
  ],
  documents: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileMulter = ({
  customPath = "general",
  validation = [],
}) => {
  const basePath = `/uploads/${customPath}/`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) userBasePath += `${req.user._id}`;
      // /uploads/users/_id
      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });

      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueFilename =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;

      // add custom property to store it in DB
      file.finalPath = `${basePath}/${req.user._id}/${uniqueFilename}`;

      cb(null, uniqueFilename);
    },
  });

  const fileFilter = (req, file, cb) => {
    // console.log(file);
    if (!validation.includes(file.mimetype))
      return cb(new Error("Invalid file type"));

    return cb(null, true);
  };

  return multer({ fileFilter, storage });
};
