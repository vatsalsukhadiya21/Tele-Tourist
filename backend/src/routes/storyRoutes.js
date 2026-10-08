const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/', authMiddleware, storyController.createStory);
router.get('/me', authMiddleware, storyController.getMyStories);
router.put('/:id', authMiddleware, storyController.updateStory);
router.delete('/:id', authMiddleware, storyController.deleteStory);

// Public route
router.get('/:id', storyController.getStory);

module.exports = router;
