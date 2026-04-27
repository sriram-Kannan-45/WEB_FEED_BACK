const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const trainingController = require('../controllers/trainingController');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// POST /api/admin/create-trainer
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

// GET /api/admin/trainers
router.get(
  '/trainers',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => authController.getTrainers(req, res)
);

// PUT /api/admin/trainers/:id
router.put(
  '/trainers/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.updateTrainer(req, res)
);

// DELETE /api/admin/trainers/:id
router.delete(
  '/trainers/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.deleteTrainer(req, res)
);

// GET /api/admin/trainings
router.get(
  '/trainings',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => trainingController.getAllTrainings(req, res)
);

// POST /api/admin/trainings
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

// PUT /api/admin/trainings/:id
router.put(
  '/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.updateTraining(req, res)
);

// DELETE /api/admin/trainings/:id
router.delete(
  '/trainings/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.deleteTraining(req, res)
);

// GET /api/admin/stats
router.get(
  '/stats',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.getStats(req, res)
);

// GET /api/admin/participants
router.get(
  '/participants',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => adminController.getParticipants(req, res)
);

module.exports = router;