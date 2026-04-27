const express = require('express');
const trainingController = require('../controllers/trainingController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public - anyone can see trainings
router.get('/', (req, res) => trainingController.getAllTrainings(req, res));
router.get('/:id', (req, res) => trainingController.getTrainingById(req, res));

// Protected
router.post('/', authenticateToken, (req, res) => trainingController.createTraining(req, res));
router.put('/:id', authenticateToken, (req, res) => trainingController.updateTraining(req, res));
router.delete('/:id', authenticateToken, (req, res) => trainingController.deleteTraining(req, res));

module.exports = router;