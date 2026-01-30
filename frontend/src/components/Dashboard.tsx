import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="container">
      <div className="card">
        <h2>Economic Indicators Dashboard</h2>
        <p>
          Welcome to the Federal Reserve Economic Indicators Dashboard. This
          application provides real-time access to key economic indicators from
          the Bureau of Labor Statistics (BLS) API.
        </p>
        <div className="grid grid-cols-1">
          <div className="card">
            <h3>Key Features</h3>
            <ul>
              <li>Real-time economic data from BLS API</li>
              <li>Interactive charts and visualizations</li>
              <li>Historical data comparison</li>
              <li>Data export functionality</li>
              <li>Responsive design for all devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard