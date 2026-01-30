import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/UI'
import { DashboardPage, IndicatorPage, ExportPage } from './pages'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/indicators" element={<DashboardPage />} />
            <Route path="/indicators/:indicatorId" element={<IndicatorPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="*" element={
              <div className="not-found">
                <h2>Page Not Found</h2>
                <p>The requested page could not be found.</p>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App