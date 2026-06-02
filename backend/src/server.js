require('dotenv').config();

const app = require('./app');
const { sequelize, testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health:   http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();
