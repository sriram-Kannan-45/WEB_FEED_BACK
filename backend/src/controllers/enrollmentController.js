const { Enrollment, Training, User, Feedback, Notification } = require('../models');
const ActivityService = require('../services/activityService');

const enrollInTraining = async (req, res) => {
  try {
    const participantId = req.user.id;
    const { trainingId } = req.body;

    if (!trainingId) {
      return res.status(422).json({ error: 'Training ID is required' });
    }

    const training = await Training.findByPk(trainingId, {
      include: [{ model: User, as: 'trainer', attributes: ['name'] }]
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { participantId, trainingId, status: 'ENROLLED' }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this training' });
    }

    if (training.capacity) {
      const enrolledCount = await Enrollment.count({
        where: { trainingId, status: 'ENROLLED' }
      });
      if (enrolledCount >= training.capacity) {
        return res.status(400).json({ error: 'Training is full' });
      }
    }

    const enrollment = await Enrollment.create({
      participantId,
      trainingId,
      status: 'ENROLLED'
    });

    const io = req.app.get('io');
    const user = await User.findByPk(participantId);

    // Notify Participant
    await Notification.create({
      userId: participantId,
      message: `You have successfully enrolled in training: ${training.title}`,
      isRead: false
    });

    // Log activity
    await ActivityService.logActivity({
      userId: participantId,
      userName: user?.name || 'Unknown',
      action: 'ENROLLMENT_DONE',
      entityType: 'Training',
      entityId: trainingId,
      details: { trainingName: training.title }
    }, io);

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enroll error:', error.message);
    res.status(500).json({ error: 'Server error during enrollment' });
  }
};

// GET /api/participant/enrollments  - returns enrollment objects with training details
const getEnrollments = async (req, res) => {
  try {
    const participantId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { participantId, status: 'ENROLLED' },
      include: [{
        model: Training,
        as: 'training',
        include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }]
      }]
    });

    const formattedEnrollments = enrollments.map(e => ({
      id: e.id,
      trainingId: e.training?.id,
      trainingTitle: e.training?.title,
      trainerName: e.training?.trainer?.name || 'TBA',
      startDate: e.training?.startDate,
      endDate: e.training?.endDate,
      capacity: e.training?.capacity,
      status: e.status,
      enrolledAt: e.enrolled_at || e.createdAt
    }));

    res.json({ enrollments: formattedEnrollments });
  } catch (error) {
    console.error('Get enrollments error:', error.message);
    res.status(500).json({ error: 'Server error fetching enrollments' });
  }
};

// Legacy: returns trainings array format
const getMyTrainings = async (req, res) => {
  try {
    const participantId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { participantId, status: 'ENROLLED' },
      include: [{
        model: Training,
        as: 'training',
        include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }]
      }]
    });

    const myTrainings = enrollments.map(e => ({
      id: e.training?.id,
      title: e.training?.title,
      description: e.training?.description,
      startDate: e.training?.startDate,
      endDate: e.training?.endDate,
      capacity: e.training?.capacity,
      trainerId: e.training?.trainerId,
      trainerName: e.training?.trainer?.name || 'TBA',
      status: e.status,
      enrolledAt: e.enrolled_at || e.createdAt
    }));

    res.json({ trainings: myTrainings });
  } catch (error) {
    console.error('Get my trainings error:', error.message);
    res.status(500).json({ error: 'Server error fetching trainings' });
  }
};

const cancelEnrollment = async (req, res) => {
  try {
    const participantId = req.user.id;
    const { trainingId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: { participantId, trainingId, status: 'ENROLLED' }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollment.status = 'CANCELLED';
    await enrollment.save();

    const io = req.app.get('io');
    const user = await User.findByPk(participantId);
    const training = await Training.findByPk(trainingId);

    // Log activity
    await ActivityService.logActivity({
      userId: participantId,
      userName: user?.name || 'Unknown',
      action: 'ENROLLMENT_CANCELLED',
      entityType: 'Training',
      entityId: trainingId,
      details: { trainingName: training?.title }
    }, io);

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    console.error('Cancel enrollment error:', error.message);
    res.status(500).json({ error: 'Server error cancelling enrollment' });
  }
};

module.exports = {
  enrollInTraining,
  getEnrollments,
  getMyTrainings,
  cancelEnrollment
};