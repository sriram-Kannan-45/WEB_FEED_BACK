const express = require('express');
const profileController = require('../controllers/profileController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.post(
  '/trainer/profile',
  authenticateToken,
  roleMiddleware('TRAINER'),
  (req, res) => profileController.createOrUpdateProfile(req, res)
);

router.put(
  '/trainer/profile',
  authenticateToken,
  roleMiddleware('TRAINER'),
  (req, res) => profileController.createOrUpdateProfile(req, res)
);

router.get(
  '/trainer/profile',
  authenticateToken,
  roleMiddleware('TRAINER'),
  (req, res) => profileController.getProfile(req, res)
);

router.get(
  '/admin/trainers',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => profileController.getAllTrainers(req, res)
);

module.exports = router;