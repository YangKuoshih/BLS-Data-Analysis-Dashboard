import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createLogger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import indicatorsRouter from './routes/indicators.js'
import exportRouter from './routes/export.js'
import healthRouter from './routes/health.js'
import type { ServerConfig } from './types/index.js'

// Load environment variables
dotenv.config()

// Create logger
const logger = createLogger()

// Server configuration
const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  blsApiKey: process.env.BLS_API_KEY,
  blsApiBaseUrl: process.env.BLS_API_BASE_URL || 'https://api.bls.gov/publicAPI',
  blsApiVersion: process.env.BLS_API_VERSION || 'v2',
  cacheTtlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || '60', 10),
  cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
}

// Create Express app
const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
})
app.use('/api', limiter)

// General middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(requestLogger)

// API routes
app.use('/api/health', healthRouter)
app.use('/api/indicators', indicatorsRouter)
app.use('/api/export', exportRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date(),
    },
  })
})

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Economic Indicators Dashboard API server running on port ${config.port}`)
  logger.info(`Environment: ${config.nodeEnv}`)
  logger.info(`BLS API Version: ${config.blsApiVersion}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

export default app