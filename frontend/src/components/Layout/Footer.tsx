import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <p>&copy; 2024 Federal Reserve Economic Indicators Dashboard</p>
            <p>Data provided by Bureau of Labor Statistics</p>
          </div>
          <div className="footer-section">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer