import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, requireOrganizer } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/image-processor.js';

const router = express.Router();

/**
 * POST /api/upload/event-image
 * Upload event image to Cloudinary
 * Requires: organizer role, authenticated
 */
router.post('/event-image', authenticate, requireOrganizer, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * DELETE /api/upload/event-image
 * Delete event image from Cloudinary
 * Requires: organizer role, authenticated
 */
router.delete('/event-image', authenticate, requireOrganizer, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Extract public ID from URL
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
