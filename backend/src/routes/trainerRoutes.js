const express = require('express');
const { Training, User, Enrollment, Feedback } = require('../models');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/trainer/trainings - trainer sees their assigned trainings
router.get(
  '/trainings',
  authenticateToken,
  roleMiddleware('TRAINER'),
  async (req, res) => {
    try {
      const trainerId = req.user.id;

      const trainings = await Training.findAll({
        where: { trainerId },
        order: [['startDate', 'ASC']]
      });

      const formattedTrainings = await Promise.all(trainings.map(async t => {
        const enrolledCount = await Enrollment.count({ where: { trainingId: t.id, status: 'ENROLLED' } });
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          startDate: t.startDate,
          endDate: t.endDate,
          capacity: t.capacity,
          enrolledCount,
          availableSeats: t.capacity ? (t.capacity - enrolledCount) : null
        };
      }));

      res.json({ trainings: formattedTrainings });
    } catch (error) {
      console.error('Trainer get trainings error:', error.message);
      res.status(500).json({ error: 'Server error fetching trainings' });
    }
  }
);

// GET /api/trainer/feedbacks - trainer sees feedback for their trainings
router.get(
  '/feedbacks',
  authenticateToken,
  roleMiddleware('TRAINER'),
  async (req, res) => {
    try {
      const trainerId = req.user.id;

      const trainings = await Training.findAll({
        where: { trainerId },
        attributes: ['id']
      });
      const trainingIds = trainings.map(t => t.id);

      if (trainingIds.length === 0) {
        return res.json({ feedbacks: [], averageRating: 0 });
      }

      const feedbacks = await Feedback.findAll({
        where: { trainingId: trainingIds },
        include: [
          { model: Training, as: 'training', attributes: ['id', 'title'] },
          { model: User, as: 'participant', attributes: ['id', 'name', 'email'] }
        ],
        order: [['submitted_at', 'DESC']]
      });

      const formattedFeedbacks = feedbacks.map(f => ({
        id: f.id,
        trainingId: f.trainingId,
        trainingTitle: f.training?.title,
        trainerRating: f.trainerRating,
        subjectRating: f.subjectRating,
        comments: f.comments,
        anonymous: f.anonymous,
        participantName: f.anonymous ? 'Anonymous' : f.participant?.name,
        submittedAt: f.submitted_at || f.createdAt
      }));

      const avgTrainerRating = feedbacks.length > 0
        ? (feedbacks.reduce((s, f) => s + f.trainerRating, 0) / feedbacks.length).toFixed(1)
        : 0;
      const avgSubjectRating = feedbacks.length > 0
        ? (feedbacks.reduce((s, f) => s + f.subjectRating, 0) / feedbacks.length).toFixed(1)
        : 0;

      res.json({
        feedbacks: formattedFeedbacks,
        averageTrainerRating: avgTrainerRating,
        averageSubjectRating: avgSubjectRating,
        averageRating: avgTrainerRating
      });
    } catch (error) {
      console.error('Trainer get feedbacks error:', error.message);
      res.status(500).json({ error: 'Server error fetching feedbacks' });
    }
  }
);

// GET /api/trainer/profile
router.get(
  '/profile',
  authenticateToken,
  roleMiddleware('TRAINER'),
  async (req, res) => {
    try {
      const trainer = await User.findByPk(req.user.id, {
        attributes: ['id', 'name', 'email', 'username', 'phone']
      });
      res.json({ trainer });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
