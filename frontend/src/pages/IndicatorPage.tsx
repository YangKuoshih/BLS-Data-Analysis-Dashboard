import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, LoadingSpinner } from '../components/UI'

const IndicatorPage: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>()

  const indicatorInfo = {
    cpi: {
      name: 'Consumer Price Index',
      description: 'The Consumer Price Index (CPI) measures changes in the price level of consumer goods and services purchased by households.',
      icon: '📈'
    },
    ppi: {
      name: 'Producer Price Index',
      description: 'The Producer Price Index (PPI) measures the average change in selling prices received by domestic producers for their output.',
      icon: '🏭'
    },
    unemployment: {
      name: 'Unemployment Rate',
      description: 'The unemployment rate represents the percentage of the labor force that is unemployed and actively seeking employment.',
      icon: '👥'
    },
    employment: {
      name: 'Employment Statistics',
      description: 'Total employment statistics including nonfarm payrolls and employment levels across various sectors.',
      icon: '💼'
    },
    'labor-force': {
      name: 'Labor Force Participation Rate',
      description: 'The labor force participation rate is the percentage of the working-age population that is in the labor force.',
      icon: '👷'
    },
    wages: {
      name: 'Average Hourly Earnings',
      description: 'Average hourly earnings for all employees on private nonfarm payrolls by industry sector.',
      icon: '💰'
    }
  }

  const indicator = indicatorId ? indicatorInfo[indicatorId as keyof typeof indicatorInfo] : null

  if (!indicator) {
    return (
      <div className="indicator-page">
        <Card variant="outlined">
          <div className="error-content">
            <h2>Indicator Not Found</h2>
            <p>The requested economic indicator could not be found.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="indicator-page">
      <div className="page-header">
        <div className="indicator-title">
          <span className="indicator-icon-large">{indicator.icon}</span>
          <div>
            <h1>{indicator.name}</h1>
            <p>{indicator.description}</p>
          </div>
        </div>
      </div>

      <div className="indicator-content">
        <Card title="Current Data" variant="elevated">
          <LoadingSpinner message="Loading economic data..." />
        </Card>

        <Card title="Historical Chart" variant="elevated">
          <div className="chart-placeholder">
            <p>Interactive chart will be displayed here</p>
            <p>Chart.js integration coming in next task</p>
          </div>
        </Card>

        <Card title="Data Analysis" variant="outlined">
          <div className="analysis-content">
            <h4>Key Insights</h4>
            <ul>
              <li>Data analysis and trends will be displayed here</li>
              <li>Historical comparisons and patterns</li>
              <li>Economic implications and context</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default IndicatorPage