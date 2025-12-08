import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-connect/events',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );


    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

export function extractPublicId(imageUrl) {
  if (!imageUrl) return null;

  try {
    const regex = /\/campus-connect\/events\/[^.]+/;
    const match = imageUrl.match(regex);
    return match ? match[0].substring(1) : null; // Remove leading slash
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}
