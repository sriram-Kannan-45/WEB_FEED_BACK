const { Training, Enrollment, Feedback, User } = require('../models');

const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, trainerId, startDate, endDate, capacity } = req.body;

    const training = await Training.findByPk(id);
    if (!training) return res.status(404).json({ error: 'Training not found' });

    if (trainerId) {
      const trainer = await User.findOne({ where: { id: trainerId, role: 'TRAINER' } });
      if (!trainer) return res.status(400).json({ error: 'Invalid trainer ID' });
    }

    await training.update({
      title: title || training.title,
      description: description !== undefined ? description : training.description,
      trainerId: trainerId ? parseInt(trainerId) : training.trainerId,
      startDate: startDate ? new Date(startDate) : training.startDate,
      endDate: endDate ? new Date(endDate) : training.endDate,
      capacity: capacity !== undefined ? (capacity ? parseInt(capacity) : null) : training.capacity
    });

    const updatedTraining = await Training.findByPk(id, {
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name'], required: false }]
    });

    res.json({
      message: 'Training updated successfully',
      training: {
        id: updatedTraining.id,
        title: updatedTraining.title,
        description: updatedTraining.description,
        trainerId: updatedTraining.trainerId,
        trainerName: updatedTraining.trainer?.name,
        startDate: updatedTraining.startDate,
        endDate: updatedTraining.endDate,
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
    if (!training) return res.status(404).json({ error: 'Training not found' });

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
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    if (email && email !== trainer.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Email already in use' });
    }

    await trainer.update({ name: name || trainer.name, email: email || trainer.email });

    res.json({
      message: 'Trainer updated successfully',
      trainer: { id: trainer.id, name: trainer.name, email: trainer.email, username: trainer.username }
    });
  } catch (error) {
    console.error('Update trainer error:', error.message);
    res.status(500).json({ error: 'Server error updating trainer' });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await User.findOne({ where: { id, role: 'TRAINER' } });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    await Training.update({ trainerId: null }, { where: { trainerId: id } });
    await User.destroy({ where: { id } });

    res.json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Delete trainer error:', error.message);
    res.status(500).json({ error: 'Server error deleting trainer' });
  }
};

const getStats = async (req, res) => {
  try {
    const totalTrainings = await Training.count();
    const totalTrainers = await User.count({ where: { role: 'TRAINER' } });
    const totalParticipants = await User.count({ where: { role: 'PARTICIPANT' } });
    const totalEnrollments = await Enrollment.count({ where: { status: 'ENROLLED' } });
    const totalFeedbacks = await Feedback.count();

    const feedbacks = await Feedback.findAll({ attributes: ['trainerRating', 'subjectRating'] });
    const avgTrainerRating = feedbacks.length > 0
      ? (feedbacks.reduce((s, f) => s + f.trainerRating, 0) / feedbacks.length).toFixed(1) : 0;
    const avgSubjectRating = feedbacks.length > 0
      ? (feedbacks.reduce((s, f) => s + f.subjectRating, 0) / feedbacks.length).toFixed(1) : 0;

    res.json({ totalTrainings, totalTrainers, totalParticipants, totalEnrollments, totalFeedbacks, avgTrainerRating, avgSubjectRating });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};

const getParticipants = async (req, res) => {
  try {
    const participants = await User.findAll({
      where: { role: 'PARTICIPANT' },
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']]
    });

    const formattedParticipants = participants.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      username: p.username,
      joinedAt: p.createdAt || p.dataValues.created_at || p.dataValues.createdAt
    }));

    res.json({ participants: formattedParticipants });
  } catch (error) {
    console.error('Get participants error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error fetching participants' });
  }
};

module.exports = { updateTraining, deleteTraining, updateTrainer, deleteTrainer, getStats, getParticipants };