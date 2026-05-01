require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { sequelize, connectDB } = require('./config/db');
const logger = require('./utils/logger');
const {
  initializeSocket,
  setupRedisAdapter,
  cleanupSocket,
} = require('./config/socket');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const noteRoutes = require('./routes/noteRoutes');
const feedRoutes = require('./routes/feedRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global request logger
app.use((req, res, next) => {
  console.log('➡️ API HIT:', req.method, req.originalUrl);
  next();
});

// ROUTE MOUNTING (order matters — more specific first)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/participant', enrollmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/feed', feedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Global 404 fallback with detailed logging
app.use((req, res) => {
  console.error('❌ ENDPOINT NOT FOUND:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });

    // Initialize Socket.IO
    const io = initializeSocket(server);
    app.set('io', io);
    logger.info('Socket.IO initialized');

    // Setup Redis adapter for multi-instance scaling
    if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
      try {
        await setupRedisAdapter(io);
        logger.info('Redis adapter configured for Socket.IO scaling');
      } catch (error) {
        logger.warn('Redis adapter setup failed, running without Redis', { 
          error: error.message 
        });
      }
    } else {
      logger.info('Running Socket.IO in single-instance mode (no Redis)');
    }

    // Create default admin if not exists
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
      logger.info('Default admin created: admin@test.com / admin123');
    } else {
      logger.info('Admin already exists');
    }

    server.listen(PORT, () => {
      logger.info(`🚀 WAVE INIT LMS Server running on http://localhost:${PORT}`);
      logger.info(`📋 Mounted routes:
   /api/auth      → auth routes
   /api/admin     → admin routes (+ analytics endpoints)
   /api/trainer   → trainer routes
   /api/participant → enrollment routes
   /api/feedback  → feedback routes
   /api/trainings → training routes
   /api/feed      → activity feed routes
   /api/notifications → notification routes (+ Socket.IO)
   /api/notes     → notes routes
   /api/survey    → survey routes
      `);
      logger.info('🔌 WebSocket server active on Socket.IO');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await cleanupSocket(io);
        await sequelize.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await cleanupSocket(io);
        await sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server };