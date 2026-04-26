const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const trainingController = require('../controllers/trainingController');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.post(
  '/admin/create-trainer',
  authenticateToken,
  roleMiddleware('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  (req, res) => authController.createTrainer(req, res)
);

router.put(
  '/admin/trainers/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.updateTrainer(req, res)
);

router.get(
  '/trainers',
  authenticateToken,
  (req, res) => authController.getTrainers(req, res)
);

router.get(
  '/admin/trainers',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => authController.getTrainers(req, res)
);

router.post(
  '/admin/trainings',
  authenticateToken,
  roleMiddleware('ADMIN'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('trainerId').notEmpty().withMessage('Trainer ID is required'),
    body('schedule').notEmpty().withMessage('Schedule is required')
  ],
  (req, res) => trainingController.createTraining(req, res)
);

router.put(
  '/admin/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.updateTraining(req, res)
);

router.delete(
  '/admin/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.deleteTraining(req, res)
);

module.exports = router;