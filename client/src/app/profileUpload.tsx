import axios from "axios";

// Correct Cloudinary URL format
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dm774chst/image/upload";
const UPLOAD_PRESET = "ProfilePics"; // Replace with your Cloudinary preset name

/**
 * Uploads a profile picture to Cloudinary.
 * @param file - The profile picture file to upload.
 * @returns The secure URL of the uploaded image.
 * @throws Error if the upload fails.
 */
export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      return response.data.secure_url; // Return the URL of the uploaded image
    } else {
      throw new Error("Failed to upload profile picture");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
