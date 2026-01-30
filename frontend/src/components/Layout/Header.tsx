import React from 'react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  title?: string
  subtitle?: string
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Economic Indicators Dashboard",
  subtitle = "Federal Reserve Economic Analysis"
}) => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/" className="brand-link">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </Link>
          </div>
          <nav className="header-nav">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/indicators" className="nav-link">Indicators</Link>
            <Link to="/export" className="nav-link">Export</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header