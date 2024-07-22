import multer from "multer";
import { AppError } from "../../utils/classError.js";

export const vaildExtentions = {
  image: [
    "image/apng",
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/mkv"],
};
export const multerHost = (customValidation = vaildExtentions.image) => {
  const storage = multer.diskStorage({});

  const fileFilter = function (req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new AppError("file not supported"), false);
  };

  const upload = multer({ storage, fileFilter });
  return upload;
};
