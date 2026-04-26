const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post(
  '/auth/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone is required')
  ],
  (req, res) => authController.register(req, res)
);

router.post(
  '/auth/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  (req, res) => authController.login(req, res)
);

router.post(
  '/auth/change-password',
  authenticateToken,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  (req, res) => authController.changePassword(req, res)
);

module.exports = router;