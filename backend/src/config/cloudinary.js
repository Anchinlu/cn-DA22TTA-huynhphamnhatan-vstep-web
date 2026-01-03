import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vstep-assets",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg", "mp3", "wav"],
  },
});

const memoryStorage = multer.memoryStorage();

export const uploadMedia = multer({ storage: cloudStorage });
export const uploadExcel = multer({ storage: memoryStorage });
export { cloudinary };
