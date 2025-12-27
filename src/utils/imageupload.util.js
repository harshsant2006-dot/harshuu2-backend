/**
 * HARSHUU 2.0 – Image Upload Utility
 * ---------------------------------
 * Purpose:
 * - Validate Base64 images
 * - Upload images to cloud (Cloudinary)
 * - Return secure image URL
 *
 * This utility is used by:
 * - Restaurant image upload
 * - Dish image upload
 * - QR image upload
 */

const cloudinary = require("cloudinary").v2;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

/**
 * ===============================
 * Cloudinary Configuration
 * ===============================
 */
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

/**
 * ===============================
 * Validate Base64 Image
 * ===============================
 */
function validateBase64Image(base64) {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("Image data is required");
  }

  const isBase64 = /^data:image\/(png|jpeg|jpg|webp);base64,/.test(base64);
  if (!isBase64) {
    throw new Error("Invalid image format. Only PNG, JPG, JPEG, WEBP allowed");
  }

  const sizeInBytes = Buffer.byteLength(base64, "base64");
  const maxSize = 5 * 1024 * 1024; // 5MB limit

  if (sizeInBytes > maxSize) {
    throw new Error("Image size exceeds 5MB limit");
  }
}

/**
 * ===============================
 * Upload Image to Cloudinary
 * ===============================
 */
async function uploadImage(base64, folder) {
  validateBase64Image(base64);

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: `harshuu/${folder}`,
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (err) {
    throw new Error("Image upload failed");
  }
}

/**
 * ===============================
 * Delete Image (Optional)
 * ===============================
 */
async function deleteImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // silently fail (do not break app)
  }
}

module.exports = {
  uploadImage,
  deleteImage
};
