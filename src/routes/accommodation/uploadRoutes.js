import express from 'express';
import upload from '../../middleware/upload.js';
// import { protect } from '../middleware/authMiddleware.js';
import ResponseHandler from '../../views/accommodation/responseHandler.js';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
router.post('/single', /* protect, */ upload.single('image'), (req, res) => {
  if (!req.file) {
    return ResponseHandler.error(res, { statusCode: 400, message: 'No image file provided' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return ResponseHandler.success(res, {
    message: 'Image uploaded!',
    data: { url: imageUrl, filename: req.file.filename },
  });
});

// @desc    Upload multiple images (max 5)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple',/* protect, */ upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ResponseHandler.error(res, { statusCode: 400, message: 'No image files provided' });
  }

  const images = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
  }));

  return ResponseHandler.success(res, {
    message: `${images.length} image(s) uploaded!`,
    data: images,
  });
});

export default router;