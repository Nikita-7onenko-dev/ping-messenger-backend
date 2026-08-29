import cloudinary from "@/config/cloudinary.js";
import { ApiError } from "@/exceptions/ApiError.js";

export async function avatarDestroy(publicId: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
      return;
    } catch (err) {
      if (attempt === 3) {
        console.error(err);
        throw ApiError.serviceUnavailable();
      }
    }
  }
}
