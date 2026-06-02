const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const hpp = require('hpp');

const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// --- Security Middleware ---

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// --- Body Parsing ---

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// --- Logging ---

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- API Documentation ---

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Manager API Documentation',
}));

// --- Health Check ---

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- Handle undefined routes ---

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// --- Global Error Handler ---

app.use(errorHandler);

module.exports = app;
