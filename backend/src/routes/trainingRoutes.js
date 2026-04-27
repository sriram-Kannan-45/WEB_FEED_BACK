const express = require('express');
const trainingController = require('../controllers/trainingController');
const authenticateToken = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

// GET /api/trainings - Public, but auth optional (shows isEnrolled if logged in)
router.get('/', optionalAuth, (req, res) => trainingController.getAllTrainings(req, res));

// GET /api/trainings/:id - Public
router.get('/:id', (req, res) => trainingController.getTrainingById(req, res));

// POST /api/trainings - Admin only (create training)
router.post('/', authenticateToken, (req, res) => trainingController.createTraining(req, res));

// PUT /api/trainings/:id - Admin only
router.put('/:id', authenticateToken, (req, res) => trainingController.updateTraining(req, res));

// DELETE /api/trainings/:id - Admin only
router.delete('/:id', authenticateToken, (req, res) => trainingController.deleteTraining(req, res));

module.exports = router;