import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  test('renders Economic Indicators Dashboard header title', () => {
    render(<App />)
    const titleElement = screen.getByRole('heading', { level: 1, name: /Economic Indicators Dashboard/i })
    expect(titleElement).toBeInTheDocument()
  })

  test('renders Federal Reserve subtitle', () => {
    render(<App />)
    const subtitleElement = screen.getByText(/Federal Reserve Economic Analysis/i)
    expect(subtitleElement).toBeInTheDocument()
  })

  test('renders main dashboard component', () => {
    render(<App />)
    const welcomeText = screen.getByText(/Welcome to the Federal Reserve Economic Indicators Dashboard/i)
    expect(welcomeText).toBeInTheDocument()
  })

  test('renders key features list', () => {
    render(<App />)
    const featuresHeading = screen.getByRole('heading', { level: 3, name: /Key Features/i })
    expect(featuresHeading).toBeInTheDocument()
    
    const realTimeDataFeature = screen.getByText(/Real-time economic data from BLS API/i)
    expect(realTimeDataFeature).toBeInTheDocument()
  })
})