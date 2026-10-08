const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// Public route to get categories
router.get('/', storyController.getCategories);

module.exports = router;
