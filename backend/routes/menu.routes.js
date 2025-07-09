// backend/routes/menu.routes.js
const express = require('express')
const router = express.Router()
const { createMenu } = require('../controllers/menu.controllers')
const { protect } = require('../middlewares/auth.middlewares')

const {
    authenticateUser,
    authorizeRoles
} = require('../middlewares/auth.middlewares');

// @route   POST /api/menus
// @access  Private
router.post('/',authenticateUser, createMenu)

module.exports = router
