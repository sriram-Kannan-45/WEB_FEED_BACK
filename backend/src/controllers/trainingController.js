const { Training, User, Enrollment, Notification } = require('../models');
const { Op } = require('sequelize');

const createTraining = async (req, res) => {
  try {
    const { title, description, trainerId, startDate, endDate, capacity } = req.body;

    if (!title) return res.status(422).json({ error: 'Title is required' });
    if (!trainerId) return res.status(422).json({ error: 'Trainer ID is required' });
    if (!startDate || !endDate) return res.status(422).json({ error: 'Start and end dates are required' });

    const trainer = await User.findOne({ where: { id: trainerId, role: 'TRAINER' } });
    if (!trainer) return res.status(400).json({ error: 'Invalid trainer ID or user is not a TRAINER' });

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) return res.status(422).json({ error: 'Invalid start date format' });
    if (isNaN(end.getTime())) return res.status(422).json({ error: 'Invalid end date format' });
    if (end <= start) return res.status(422).json({ error: 'End date must be after start date' });

    const training = await Training.create({
      title,
      description: description || null,
      trainerId: parseInt(trainerId),
      startDate: start,
      endDate: end,
      capacity: capacity ? parseInt(capacity) : null,
      createdBy: req.user.id
    });

    // Notify Trainer
    await Notification.create({
      userId: trainer.id,
      message: `You have been assigned as the instructor for training: ${training.title}`,
      isRead: false
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

    // Fetch all trainings WITHOUT filtering the trainer include
    // Use LEFT JOIN without WHERE on the joined table to avoid filtering out rows
    const trainings = await Training.findAll({
      include: [
        {
          model: User,
          as: 'trainer',
          attributes: ['id', 'name', 'email'],
          required: false   // true LEFT JOIN — no WHERE on trainer
        }
      ],
      order: [['id', 'DESC']]  // Use primary key ordering (always safe)
    });

    console.log('📋 Raw trainings from DB:', trainings.length);

    // Format the results
    const formattedTrainings = await Promise.all(trainings.map(async t => {
      let enrolledCount = 0;
      try {
        enrolledCount = await Enrollment.count({
          where: { trainingId: t.id, status: 'ENROLLED' }
        });
      } catch (e) {
        console.error('Count error for training', t.id, e.message);
      }

      let isEnrolled = false;
      if (userId && userRole === 'PARTICIPANT') {
        try {
          const enrollment = await Enrollment.findOne({
            where: { participantId: userId, trainingId: t.id, status: 'ENROLLED' }
          });
          isEnrolled = !!enrollment;
        } catch (e) {
          console.error('Enrollment check error:', e.message);
        }
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
        isFull: t.capacity ? enrolledCount >= t.capacity : false
      };
    }));

    console.log('📋 Returning', formattedTrainings.length, 'trainings');
    res.json(formattedTrainings);
  } catch (error) {
    console.error('Get trainings error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error fetching trainings' });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findByPk(id, {
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name', 'email'], required: false }]
    });

    if (!training) return res.status(404).json({ error: 'Training not found' });

    res.json({
      id: training.id,
      title: training.title,
      description: training.description,
      trainerId: training.trainerId,
      trainerName: training.trainer ? training.trainer.name : null,
      startDate: training.startDate,
      endDate: training.endDate,
      capacity: training.capacity
    });
  } catch (error) {
    console.error('Get training by ID error:', error.message);
    res.status(500).json({ error: 'Server error fetching training' });
  }
};

module.exports = { createTraining, getAllTrainings, getTrainingById };