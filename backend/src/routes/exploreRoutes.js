const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');

// Public route for discovery
router.get('/stories', exploreController.getExploreStories);

module.exports = router;
