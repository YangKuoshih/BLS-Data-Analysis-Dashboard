import { Router } from 'express'
import type { ApiResponse } from '../types/index.js'

const router = Router()

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: Date
  uptime: number
  version: string
  environment: string
}

// Health check endpoint
router.get('/', (req, res) => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }

  const response: ApiResponse<HealthStatus> = {
    success: true,
    data: healthStatus,
    timestamp: new Date(),
  }

  res.json(response)
})

// Detailed health check
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage()
  
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    cpu: process.cpuUsage(),
  }

  const response: ApiResponse = {
    success: true,
    data: detailedHealth,
    timestamp: new Date(),
  }

  res.json(response)
})

export default router