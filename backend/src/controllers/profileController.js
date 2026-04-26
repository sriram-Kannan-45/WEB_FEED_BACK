const { User, TrainerProfile } = require('../models');

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dob, phone, address, qualification, experience } = req.body;

    let profile = await TrainerProfile.findOne({ where: { userId } });

    if (profile) {
      await profile.update({
        dob: dob || profile.dob,
        phone: phone || profile.phone,
        address: address || profile.address,
        qualification: qualification || profile.qualification,
        experience: experience || profile.experience
      });
      res.json({ message: 'Profile updated successfully', profile });
    } else {
      profile = await TrainerProfile.create({
        userId,
        dob,
        phone,
        address,
        qualification,
        experience
      });
      res.status(201).json({ message: 'Profile created successfully', profile });
    }
  } catch (error) {
    console.error('Profile save error:', error.message);
    res.status(500).json({ error: 'Server error saving profile' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await TrainerProfile.findOne({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'username']
      }]
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

const getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.findAll({
      where: { role: 'TRAINER' },
      attributes: ['id', 'name', 'email', 'username'],
      include: [{
        model: TrainerProfile,
        as: 'profile',
        attributes: ['dob', 'phone', 'address', 'qualification', 'experience']
      }]
    });

    res.json({ trainers });
  } catch (error) {
    console.error('Get trainers error:', error.message);
    res.status(500).json({ error: 'Server error fetching trainers' });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  getAllTrainers
};