const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categories');
const protect = require('../middleware/auth'); // seu middleware JWT

// GET /api/categories
router.get('/', protect, getCategories);

module.exports = router;
