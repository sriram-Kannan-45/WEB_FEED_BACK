const { Training, User, Enrollment } = require('../models');

const createTraining = async (req, res) => {
  try {
    const { title, description, trainerId, startDate, endDate, capacity } = req.body;

    if (!title) {
      return res.status(422).json({ error: 'Title is required' });
    }

    if (!trainerId) {
      return res.status(422).json({ error: 'Trainer ID is required' });
    }

    if (!startDate || !endDate) {
      return res.status(422).json({ error: 'Start date and end date are required' });
    }

    const trainer = await User.findOne({
      where: { id: trainerId, role: 'TRAINER' }
    });

    if (!trainer) {
      return res.status(400).json({ error: 'Invalid trainer ID or user is not a TRAINER' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(422).json({ error: 'Invalid start date format' });
    }

    if (isNaN(end.getTime())) {
      return res.status(422).json({ error: 'Invalid end date format' });
    }

    if (end <= start) {
      return res.status(422).json({ error: 'End date must be after start date' });
    }

    const training = await Training.create({
      title,
      description: description || null,
      trainerId: parseInt(trainerId),
      startDate: start,
      endDate: end,
      capacity: capacity ? parseInt(capacity) : null,
      createdBy: req.user.id
    });

    console.log('✅ Training saved:', training.id, '-', training.title);

    res.status(201).json({
      id: training.id,
      title: training.title,
      description: training.description,
      trainerId: training.trainerId,
      trainerName: trainer.name,
      startDate: training.startDate,
      endDate: training.endDate,
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

    console.log('📋 getAllTrainings called, user:', userId, 'role:', userRole);

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
      order: [['createdAt', 'DESC']]
    });

    console.log('📋 Raw trainings from DB:', trainings.length, trainings.map(t => t.title));

    if (trainings.length === 0) {
      return res.json({ count: 0, trainings: [] });
    }

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
        startDate: t.startDate,
        endDate: t.endDate,
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