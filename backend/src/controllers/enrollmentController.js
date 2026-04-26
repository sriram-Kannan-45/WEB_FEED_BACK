const { Enrollment, Training, User } = require('../models');

const enrollInTraining = async (req, res) => {
  try {
    const participantId = req.user.id;
    const { trainingId } = req.body;

    if (!trainingId) {
      return res.status(422).json({ error: 'Training ID is required' });
    }

    const training = await Training.findByPk(trainingId, {
      include: [{
        model: User,
        as: 'trainer',
        attributes: ['name']
      }]
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

    await Enrollment.create({
      participantId,
      trainingId,
      status: 'ENROLLED'
    });

    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll error:', error.message);
    res.status(500).json({ error: 'Server error during enrollment' });
  }
};

const getMyTrainings = async (req, res) => {
  try {
    const participantId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { participantId, status: 'ENROLLED' },
      include: [{
        model: Training,
        as: 'training',
        include: [{
          model: User,
          as: 'trainer',
          attributes: ['id', 'name']
        }]
      }]
    });

    const myTrainings = enrollments.map(e => ({
      id: e.training.id,
      title: e.training.title,
      description: e.training.description,
      schedule: e.training.schedule,
      capacity: e.training.capacity,
      trainerId: e.training.trainerId,
      trainerName: e.training.trainer?.name || 'TBA',
      status: e.status,
      enrolledAt: e.enrolled_at
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

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    console.error('Cancel enrollment error:', error.message);
    res.status(500).json({ error: 'Server error cancelling enrollment' });
  }
};

module.exports = {
  enrollInTraining,
  getMyTrainings,
  cancelEnrollment
};