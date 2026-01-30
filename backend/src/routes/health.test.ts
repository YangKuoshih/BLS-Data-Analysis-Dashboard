import request from 'supertest'
import express from 'express'
import healthRouter from './health'

const app = express()
app.use('/health', healthRouter)

describe('Health Routes', () => {
  test('GET /health returns healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('healthy')
    expect(response.body.data).toHaveProperty('timestamp')
    expect(response.body.data).toHaveProperty('uptime')
    expect(response.body.data).toHaveProperty('version')
    expect(response.body.data).toHaveProperty('environment')
  })

  test('GET /health/detailed returns detailed health information', async () => {
    const response = await request(app)
      .get('/health/detailed')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('healthy')
    expect(response.body.data).toHaveProperty('memory')
    expect(response.body.data).toHaveProperty('cpu')
    expect(response.body.data.memory).toHaveProperty('rss')
    expect(response.body.data.memory).toHaveProperty('heapTotal')
    expect(response.body.data.memory).toHaveProperty('heapUsed')
  })
})