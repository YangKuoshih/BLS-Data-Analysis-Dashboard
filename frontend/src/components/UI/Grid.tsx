import React from 'react'

interface GridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  columns = 3, 
  gap = 'md',
  className = '' 
}) => {
  const gridClasses = [
    'responsive-grid',
    `grid-cols-${columns}`,
    `gap-${gap}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

export default Grid