import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard Overview',
      icon: '📊'
    },
    {
      path: '/indicators/cpi',
      label: 'Consumer Price Index',
      icon: '📈'
    },
    {
      path: '/indicators/ppi',
      label: 'Producer Price Index',
      icon: '🏭'
    },
    {
      path: '/indicators/unemployment',
      label: 'Unemployment Rate',
      icon: '👥'
    },
    {
      path: '/indicators/employment',
      label: 'Employment Statistics',
      icon: '💼'
    },
    {
      path: '/indicators/labor-force',
      label: 'Labor Force Participation',
      icon: '👷'
    },
    {
      path: '/indicators/wages',
      label: 'Average Hourly Earnings',
      icon: '💰'
    },
    {
      path: '/export',
      label: 'Data Export',
      icon: '📥'
    }
  ]

  return (
    <nav className="sidebar-nav">
      <div className="nav-section">
        <h3 className="nav-section-title">Economic Indicators</h3>
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Sidebar