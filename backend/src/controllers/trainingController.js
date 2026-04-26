const { Training, User, Enrollment } = require('../models');

const createTraining = async (req, res) => {
  try {
    const { title, description, trainerId, schedule, capacity } = req.body;

    if (!title) {
      return res.status(422).json({ error: 'Title is required' });
    }

    if (!trainerId) {
      return res.status(422).json({ error: 'Trainer ID is required' });
    }

    if (!schedule) {
      return res.status(422).json({ error: 'Schedule is required' });
    }

    const trainer = await User.findOne({
      where: { id: trainerId, role: 'TRAINER' }
    });

    if (!trainer) {
      return res.status(400).json({ error: 'Invalid trainer ID or user is not a TRAINER' });
    }

    const scheduleDate = new Date(schedule);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(422).json({ error: 'Invalid schedule date format' });
    }

    const allowPast = req.query.allowPast === 'true' || process.env.TEST_MODE === 'true';
    if (!allowPast && scheduleDate <= new Date()) {
      return res.status(422).json({ error: 'Schedule must be in the future' });
    }

    const training = await Training.create({
      title,
      description: description || null,
      trainerId: parseInt(trainerId),
      schedule: scheduleDate,
      capacity: capacity ? parseInt(capacity) : null,
      createdBy: req.user.id
    });

    res.status(201).json({
      id: training.id,
      title: training.title,
      description: training.description,
      trainerId: training.trainerId,
      trainerName: trainer.name,
      schedule: training.schedule,
      capacity: training.capacity,
      message: 'Training created successfully'
    });
  } catch (error) {
    console.error('Create training error:', error.message);
    res.status(500).json({ error: 'Server error creating training' });
  }
};

const getAllTrainings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const trainings = await Training.findAll({
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email'],
          where: { role: 'TRAINER' },
          required: false
        }
      ],
      order: [['schedule', 'ASC']]
    });

    const formattedTrainings = await Promise.all(trainings.map(async t => {
      const enrolledCount = await Enrollment.count({
        where: { trainingId: t.id, status: 'ENROLLED' }
      });

      let isEnrolled = false;
      if (userId && userRole === 'PARTICIPANT') {
        const enrollment = await Enrollment.findOne({
          where: { participantId: userId, trainingId: t.id, status: 'ENROLLED' }
        });
        isEnrolled = !!enrollment;
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        trainerId: t.trainerId,
        trainerName: t.trainer ? t.trainer.name : null,
        trainerEmail: t.trainer ? t.trainer.email : null,
        schedule: t.schedule,
        capacity: t.capacity,
        enrolledCount,
        availableSeats: t.capacity ? (t.capacity - enrolledCount) : null,
        isEnrolled,
        isFull: t.capacity ? enrolledCount >= t.capacity : false,
        createdBy: t.createdBy,
        createdAt: t.created_at
      };
    }));

    res.json({
      count: formattedTrainings.length,
      trainings: formattedTrainings
    });
  } catch (error) {
    console.error('Get trainings error:', error.message);
    res.status(500).json({ error: 'Server error fetching trainings' });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findByPk(id, {
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    res.json({
      id: training.id,
      title: training.title,
      description: training.description,
      trainerId: training.trainerId,
      trainerName: training.trainer ? training.trainer.name : null,
      schedule: training.schedule,
      capacity: training.capacity
    });
  } catch (error) {
    console.error('Get training by ID error:', error.message);
    res.status(500).json({ error: 'Server error fetching training' });
  }
};

module.exports = {
  createTraining,
  getAllTrainings,
  getTrainingById
};