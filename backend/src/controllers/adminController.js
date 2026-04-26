const { Training, Enrollment, Feedback, User } = require('../models');

const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, trainerId, schedule, capacity } = req.body;

    const training = await Training.findByPk(id);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    if (trainerId) {
      const trainer = await User.findOne({ where: { id: trainerId, role: 'TRAINER' } });
      if (!trainer) {
        return res.status(400).json({ error: 'Invalid trainer ID' });
      }
    }

    let scheduleDate = training.schedule;
    if (schedule) {
      scheduleDate = new Date(schedule);
      if (isNaN(scheduleDate.getTime())) {
        return res.status(422).json({ error: 'Invalid schedule date format' });
      }
    }

    await training.update({
      title: title || training.title,
      description: description !== undefined ? description : training.description,
      trainerId: trainerId ? parseInt(trainerId) : training.trainerId,
      schedule: scheduleDate,
      capacity: capacity ? parseInt(capacity) : training.capacity
    });

    const updatedTraining = await Training.findByPk(id, {
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name'] }]
    });

    res.json({
      message: 'Training updated successfully',
      training: {
        id: updatedTraining.id,
        title: updatedTraining.title,
        description: updatedTraining.description,
        trainerId: updatedTraining.trainerId,
        trainerName: updatedTraining.trainer?.name,
        schedule: updatedTraining.schedule,
        capacity: updatedTraining.capacity
      }
    });
  } catch (error) {
    console.error('Update training error:', error.message);
    res.status(500).json({ error: 'Server error updating training' });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findByPk(id);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    await Feedback.destroy({ where: { trainingId: id } });
    await Enrollment.destroy({ where: { trainingId: id } });
    await Training.destroy({ where: { id } });

    res.json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Delete training error:', error.message);
    res.status(500).json({ error: 'Server error deleting training' });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const trainer = await User.findOne({ where: { id, role: 'TRAINER' } });
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    if (email && email !== trainer.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    await trainer.update({
      name: name || trainer.name,
      email: email || trainer.email
    });

    res.json({
      message: 'Trainer updated successfully',
      trainer: {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        username: trainer.username
      }
    });
  } catch (error) {
    console.error('Update trainer error:', error.message);
    res.status(500).json({ error: 'Server error updating trainer' });
  }
};

module.exports = {
  updateTraining,
  deleteTraining,
  updateTrainer
};