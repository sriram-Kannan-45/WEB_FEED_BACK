const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/change-password', authenticateToken, (req, res) => authController.changePassword(req, res));

module.exports = router;