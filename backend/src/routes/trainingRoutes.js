const express = require('express');
const trainingController = require('../controllers/trainingController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get(
  '/trainings',
  authenticateToken,
  (req, res) => trainingController.getAllTrainings(req, res)
);

router.get(
  '/trainings/:id',
  authenticateToken,
  (req, res) => trainingController.getTrainingById(req, res)
);

module.exports = router;