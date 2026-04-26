const { Feedback, Enrollment, Training, User } = require('../models');

const submitFeedback = async (req, res) => {
  try {
    const participantId = req.user.id;
    const { trainingId, trainerRating, subjectRating, comments, anonymous } = req.body;

    if (!trainingId || !trainerRating || !subjectRating) {
      return res.status(422).json({ error: 'Training ID and both ratings are required' });
    }

    if (trainerRating < 1 || trainerRating > 5 || subjectRating < 1 || subjectRating > 5) {
      return res.status(422).json({ error: 'Ratings must be between 1 and 5' });
    }

    const training = await Training.findByPk(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const enrollment = await Enrollment.findOne({
      where: { participantId, trainingId, status: 'ENROLLED' }
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this training' });
    }

    const existingFeedback = await Feedback.findOne({
      where: { participantId, trainingId }
    });
    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted' });
    }

    await Feedback.create({
      participantId,
      trainingId,
      trainerRating,
      subjectRating,
      comments: comments || null,
      anonymous: anonymous || false
    });

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error.message);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
};

const getTrainerFeedbacks = async (req, res) => {
  try {
    const trainerId = req.user.id;

    const trainings = await Training.findAll({
      where: { trainerId },
      attributes: ['id']
    });
    const trainingIds = trainings.map(t => t.id);

    const feedbacks = await Feedback.findAll({
      where: { trainingId: trainingIds },
      include: [{
        model: Training,
        as: 'training',
        attributes: ['id', 'title']
      }, {
        model: User,
        as: 'participant',
        attributes: ['id', 'name', 'email']
      }]
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
      submittedAt: f.submitted_at
    }));

    res.json({ feedbacks: formattedFeedbacks });
  } catch (error) {
    console.error('Get trainer feedbacks error:', error.message);
    res.status(500).json({ error: 'Server error fetching feedbacks' });
  }
};

const getAdminFeedbacks = async (req, res) => {
  try {
    const { trainerId, trainingId, rating } = req.query;

    const where = {};
    if (trainingId) where.trainingId = trainingId;

    const feedbacks = await Feedback.findAll({
      where,
      include: [{
        model: Training,
        as: 'training',
        attributes: ['id', 'title', 'schedule'],
        include: [{
          model: User,
          as: 'trainer',
          attributes: ['id', 'name']
        }]
      }, {
        model: User,
        as: 'participant',
        attributes: ['id', 'name', 'email']
      }],
      order: [['submitted_at', 'DESC']]
    });

    let filtered = feedbacks;
    if (trainerId) {
      filtered = filtered.filter(f => f.training?.trainerId === parseInt(trainerId));
    }

    const formattedFeedbacks = filtered.map(f => ({
      id: f.id,
      trainingId: f.trainingId,
      trainingTitle: f.training?.title,
      trainerName: f.training?.trainer?.name || 'Unknown',
      schedule: f.training?.schedule,
      trainerRating: f.trainerRating,
      subjectRating: f.subjectRating,
      comments: f.comments,
      anonymous: f.anonymous,
      participantName: f.anonymous ? 'Anonymous' : f.participant?.name,
      submittedAt: f.submitted_at
    }));

    const avgTrainerRating = formattedFeedbacks.length > 0
      ? (formattedFeedbacks.reduce((sum, f) => sum + f.trainerRating, 0) / formattedFeedbacks.length).toFixed(1)
      : 0;
      
    const avgSubjectRating = formattedFeedbacks.length > 0
      ? (formattedFeedbacks.reduce((sum, f) => sum + f.subjectRating, 0) / formattedFeedbacks.length).toFixed(1)
      : 0;

    res.json({
      count: formattedFeedbacks.length,
      averageTrainerRating: avgTrainerRating,
      averageSubjectRating: avgSubjectRating,
      feedbacks: formattedFeedbacks
    });
  } catch (error) {
    console.error('Get admin feedbacks error:', error.message);
    res.status(500).json({ error: 'Server error fetching feedbacks' });
  }
};

const getParticipantFeedbacks = async (req, res) => {
  try {
    const participantId = req.user.id;

    const feedbacks = await Feedback.findAll({
      where: { participantId },
      include: [{
        model: Training,
        as: 'training',
        attributes: ['id', 'title']
      }]
    });

    const formattedFeedbacks = feedbacks.map(f => ({
      id: f.id,
      trainingId: f.trainingId,
      trainingTitle: f.training?.title,
      rating: f.rating,
      comments: f.comments,
      anonymous: f.anonymous,
      submittedAt: f.submitted_at
    }));

    res.json({ feedbacks: formattedFeedbacks });
  } catch (error) {
    console.error('Get participant feedbacks error:', error.message);
    res.status(500).json({ error: 'Server error fetching feedbacks' });
  }
};

module.exports = {
  submitFeedback,
  getTrainerFeedbacks,
  getAdminFeedbacks,
  getParticipantFeedbacks
};