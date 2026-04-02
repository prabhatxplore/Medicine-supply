const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper to produce a configured Cloudinary storage engine.
 * @param {string} folder - Folder name within Cloudinary (e.g. 'medicines', 'users')
 * @returns {CloudinaryStorage}
 */
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // PDFs must use resource_type "raw", images use "image"
      const isPdf = file.mimetype === "application/pdf";
      return {
        folder: `pharmacare/${folder}`,
        resource_type: isPdf ? "raw" : "image",
        allowed_formats: isPdf ? ["pdf"] : ["jpg", "jpeg", "png", "webp"],
        // Use original filename (sanitized) for better readability
        public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`,
      };
    },
  });
};

module.exports = {
  cloudinary,
  createStorage,
};
