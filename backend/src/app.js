require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { sequelize, connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deleteRoutes = require('./routes/deleteRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', trainingRoutes);
app.use('/api', profileRoutes);
app.use('/api', deleteRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', feedbackRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const startServer = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        phone: '0000000000',
        role: 'ADMIN'
      });
      console.log('✅ Default admin created: admin@test.com / admin123');
    } else {
      console.log('✅ Admin already exists');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Endpoints:`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/admin/create-trainer`);
      console.log(`   POST /api/admin/trainings`);
      console.log(`   GET /api/trainings`);
      console.log(`   GET /api/trainers`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();