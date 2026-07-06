import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";

export const validateFileMagicNum = ({ validation = [] }) => {
  return async (req, res, next) => {
    const files = req.file ? [req.file] : req.files ? req.files : [];
    // console.log("files from fileValidation.middleware.js", files);

    for (const file of files) {
      const buffer = fs.readFileSync(file.path);
      const type = await fileTypeFromBuffer(buffer);
      if (!type || !validation.includes(type.mime)) {
        fs.unlinkSync(file.path);
        return next(
          new Error(
            `Invalid file type after conversion بطل تشغيل دماغ يسطا ${file.originalname} files after this are not accepted`,
          ),
        );
      }
    }

    return next();
  };
};


// export const validateFileMagicNumCloud = ({ validation = [] }) => {
//   return async (req, res, next) => {
//     const files = req.file ? [req.file] : req.files ? req.files : [];
//     // console.log("files from fileValidation.middleware.js", files);

//     for (const file of files) {
//       const type = await fileTypeFromBuffer(file.buffer);
//       if (!type || !validation.includes(type.mime)) {
//         return next(
//           new Error(
//             `Invalid file type after conversion بطل تشغيل دماغ يسطا ${file.originalname} files after this are not accepted`,
//           ),
//         );
//       }
//     }

//     return next();
//   };
// };