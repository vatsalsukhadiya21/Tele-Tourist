const express = require('express');
const router = express.Router();
const storyImageController = require('../controllers/storyImageController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Route prefixes will be set in server.js or storyRoutes.js
// If mounted at /api/stories/:storyId/images

// NOTE: Since this router will be mounted under /api/stories, it's easier to mount it directly in storyRoutes.js
module.exports = router;
