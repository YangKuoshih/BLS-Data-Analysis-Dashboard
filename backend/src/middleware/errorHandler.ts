import { Request, Response, NextFunction } from 'express'
import { createLogger } from '../utils/logger.js'
import type { ApiError } from '../types/index.js'

const logger = createLogger()

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Determine error response
  let statusCode = 500
  let errorCode = 'INTERNAL_SERVER_ERROR'
  let message = 'An unexpected error occurred'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    errorCode = 'VALIDATION_ERROR'
    message = err.message
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    errorCode = 'UNAUTHORIZED'
    message = 'Authentication required'
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403
    errorCode = 'FORBIDDEN'
    message = 'Access denied'
  } else if (err.name === 'NotFoundError') {
    statusCode = 404
    errorCode = 'NOT_FOUND'
    message = 'Resource not found'
  } else if (err.name === 'RateLimitError') {
    statusCode = 429
    errorCode = 'RATE_LIMIT_EXCEEDED'
    message = 'Rate limit exceeded'
  }

  // Create error response
  const apiError: ApiError = {
    code: errorCode,
    message,
    timestamp: new Date(),
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  }

  res.status(statusCode).json({
    success: false,
    error: apiError,
  })
}