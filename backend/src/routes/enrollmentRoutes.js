const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.post(
  '/enroll',
  authenticateToken,
  roleMiddleware('PARTICIPANT'),
  (req, res) => enrollmentController.enrollInTraining(req, res)
);

router.get(
  '/my-trainings',
  authenticateToken,
  roleMiddleware('PARTICIPANT'),
  (req, res) => enrollmentController.getMyTrainings(req, res)
);

router.delete(
  '/enroll/:trainingId',
  authenticateToken,
  roleMiddleware('PARTICIPANT'),
  (req, res) => enrollmentController.cancelEnrollment(req, res)
);

module.exports = router;