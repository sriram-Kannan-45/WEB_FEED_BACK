const express = require('express');
const { body } = require('express-validator');
const feedbackController = require('../controllers/feedbackController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.post(
  '/feedback',
  authenticateToken,
  roleMiddleware('PARTICIPANT'),
  [
    body('trainingId').notEmpty().withMessage('Training ID is required'),
    body('trainerRating').isInt({ min: 1, max: 5 }).withMessage('Trainer rating must be between 1 and 5'),
    body('subjectRating').isInt({ min: 1, max: 5 }).withMessage('Subject rating must be between 1 and 5')
  ],
  (req, res) => feedbackController.submitFeedback(req, res)
);

router.get(
  '/participant/feedbacks',
  authenticateToken,
  roleMiddleware('PARTICIPANT'),
  (req, res) => feedbackController.getParticipantFeedbacks(req, res)
);

router.get(
  '/trainer/feedbacks',
  authenticateToken,
  roleMiddleware('TRAINER'),
  (req, res) => feedbackController.getTrainerFeedbacks(req, res)
);

router.get(
  '/admin/feedbacks',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => feedbackController.getAdminFeedbacks(req, res)
);

module.exports = router;