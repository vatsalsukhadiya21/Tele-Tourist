const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const storyImageController = require('../controllers/storyImageController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Protected routes
router.post('/', authMiddleware, storyController.createStory);
router.get('/me', authMiddleware, storyController.getMyStories);
router.put('/:id', authMiddleware, storyController.updateStory);
router.delete('/:id', authMiddleware, storyController.deleteStory);

// Nested Image Routes
router.post('/:id/images', authMiddleware, uploadMiddleware, storyImageController.uploadImages);
router.delete('/:storyId/images/:imageId', authMiddleware, storyImageController.deleteImage);

// Public route
router.get('/:id', storyController.getStory);

module.exports = router;
