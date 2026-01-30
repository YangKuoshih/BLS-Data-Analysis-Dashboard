import { Request, Response, NextFunction } from 'express'
import { createLogger } from '../utils/logger.js'

const logger = createLogger()

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Override res.end to log response
  const originalEnd = res.end
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - start
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })

    originalEnd.call(this, chunk, encoding)
  }

  next()
}