const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const generateUsername = async (name) => {
  const baseName = name.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 4);
  let username = baseName + Math.floor(1000 + Math.random() * 9000);
  
  let exists = await User.findOne({ where: { username } });
  while (exists) {
    username = baseName + Math.floor(1000 + Math.random() * 9000);
    exists = await User.findOne({ where: { username } });
  }
  
  return username;
};

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8);
};

const login = async (req, res) => {
  try {
    const { email, username, password, role: requestedRole } = req.body;

    const credential = email || username;

    if (!credential || !password) {
      return res.status(422).json({ error: 'Email/Username and password are required' });
    }

    const user = await User.findOne({
      where: { email: credential }
    }) || await User.findOne({
      where: { username: credential }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (requestedRole && requestedRole !== user.role) {
      console.log(`⚠️ Role mismatch: requested=${requestedRole}, actual=${user.role}`);
      return res.status(403).json({ error: 'Invalid role for this account' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login success: ${user.email} as ${user.role}`);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(422).json({ error: 'Name, email, password, and phone are required' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Only participants can self-register
    // Admins and trainers must be created by admin
    const role = 'PARTICIPANT';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const createTrainer = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(422).json({ error: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const username = await generateUsername(name);
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const trainer = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      phone: null,
      role: 'TRAINER'
    });

    res.status(201).json({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      username: trainer.username,
      role: trainer.role,
      password: tempPassword,
      message: 'Trainer created successfully'
    });
  } catch (error) {
    console.error('Create trainer error:', error.message);
    res.status(500).json({ error: 'Server error creating trainer' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(422).json({ error: 'Old and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(422).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ error: 'Server error changing password' });
  }
};

const getTrainers = async (req, res) => {
  try {
    const trainers = await User.findAll({
      where: { role: 'TRAINER' },
      attributes: ['id', 'name', 'email', 'username']
    });

    res.json({ trainers });
  } catch (error) {
    console.error('Get trainers error:', error.message);
    res.status(500).json({ error: 'Server error fetching trainers' });
  }
};

module.exports = {
  login,
  register,
  createTrainer,
  changePassword,
  getTrainers
};