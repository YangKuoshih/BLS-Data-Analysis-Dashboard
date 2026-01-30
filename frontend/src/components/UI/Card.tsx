import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = '',
  variant = 'default'
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

export default Card