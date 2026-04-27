const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const trainingController = require('../controllers/trainingController');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.post(
  '/create-trainer',
  authenticateToken,
  roleMiddleware('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  (req, res) => authController.createTrainer(req, res)
);

router.put(
  '/trainers/:id',
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
  '/trainings',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => trainingController.getAllTrainings(req, res)
);

router.post(
  '/trainings',
  authenticateToken,
  roleMiddleware('ADMIN'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('trainerId').notEmpty().withMessage('Trainer ID is required')
  ],
  (req, res) => trainingController.createTraining(req, res)
);

router.put(
  '/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.updateTraining(req, res)
);

router.delete(
  '/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.deleteTraining(req, res)
);

module.exports = router;