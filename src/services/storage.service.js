import supabase from "../config/database.js";

const BUCKET_NAME = "receipts";

/**
 * Upload receipt image to Supabase Storage
 * @param {Buffer} buffer - Image file buffer
 * @param {string} mimetype - Image MIME type
 * @param {string} userId - User ID for organizing files
 * @returns {Promise<Object>} Upload result with public URL
 */
const uploadReceiptImage = async (buffer, mimetype, userId) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimetype.split("/")[1]; // e.g., 'jpeg' from 'image/jpeg'
    const filename = `${userId}/${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload receipt image error:", error);
    throw error;
  }
};

/**
 * Delete receipt image from Supabase Storage
 * @param {string} filePath - File path in storage (e.g., "user-id/timestamp.jpg")
 * @returns {Promise<boolean>} Success status
 */
const deleteReceiptImage = async (filePath) => {
  try {
    if (!filePath) return false;

    // Extract path from URL if full URL is provided
    let path = filePath;
    if (filePath.includes(BUCKET_NAME)) {
      path = filePath.split(`${BUCKET_NAME}/`)[1];
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Delete image error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete receipt image error:", error);
    return false;
  }
};

/**
 * Get signed URL for private receipt (if needed in future)
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<string>} Signed URL
 */
const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Get signed URL error:", error);
    throw error;
  }
};

export { deleteReceiptImage, getSignedUrl, uploadReceiptImage };
