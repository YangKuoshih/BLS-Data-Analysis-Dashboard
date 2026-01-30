import React from 'react'
import { Grid, Card } from '../components/UI'

const DashboardPage: React.FC = () => {
  const indicators = [
    {
      id: 'cpi',
      name: 'Consumer Price Index',
      description: 'Measures changes in the price level of consumer goods and services',
      value: '3.2%',
      change: '+0.1%',
      trend: 'up',
      icon: '📈'
    },
    {
      id: 'ppi',
      name: 'Producer Price Index',
      description: 'Measures average change in selling prices by domestic producers',
      value: '2.8%',
      change: '-0.2%',
      trend: 'down',
      icon: '🏭'
    },
    {
      id: 'unemployment',
      name: 'Unemployment Rate',
      description: 'Percentage of labor force that is unemployed and seeking employment',
      value: '3.7%',
      change: '0.0%',
      trend: 'stable',
      icon: '👥'
    },
    {
      id: 'employment',
      name: 'Total Employment',
      description: 'Total number of employed persons in the economy',
      value: '156.2M',
      change: '+150K',
      trend: 'up',
      icon: '💼'
    },
    {
      id: 'labor-force',
      name: 'Labor Force Participation',
      description: 'Percentage of working-age population in the labor force',
      value: '62.8%',
      change: '+0.1%',
      trend: 'up',
      icon: '👷'
    },
    {
      id: 'wages',
      name: 'Average Hourly Earnings',
      description: 'Average hourly earnings for all employees on private nonfarm payrolls',
      value: '$34.26',
      change: '+0.4%',
      trend: 'up',
      icon: '💰'
    }
  ]

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-success'
      case 'down': return 'text-error'
      default: return 'text-secondary'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '➡️'
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Economic Indicators Dashboard</h1>
        <p>Real-time economic data from the Bureau of Labor Statistics</p>
      </div>

      <Grid columns={3} gap="lg">
        {indicators.map((indicator) => (
          <Card 
            key={indicator.id}
            variant="elevated"
            className="indicator-card"
          >
            <div className="indicator-header">
              <div className="indicator-icon">{indicator.icon}</div>
              <div className="indicator-info">
                <h3 className="indicator-name">{indicator.name}</h3>
                <p className="indicator-description">{indicator.description}</p>
              </div>
            </div>
            
            <div className="indicator-metrics">
              <div className="metric-primary">
                <span className="metric-value">{indicator.value}</span>
              </div>
              <div className="metric-change">
                <span className={`change-value ${getTrendColor(indicator.trend)}`}>
                  {getTrendIcon(indicator.trend)} {indicator.change}
                </span>
              </div>
            </div>

            <div className="indicator-actions">
              <button className="btn btn-secondary btn-sm">View Details</button>
              <button className="btn btn-primary btn-sm">View Chart</button>
            </div>
          </Card>
        ))}
      </Grid>

      <div className="dashboard-summary">
        <Card title="Economic Summary" variant="outlined">
          <div className="summary-content">
            <p>
              Current economic indicators show mixed signals with inflation measures 
              remaining elevated while employment metrics continue to demonstrate strength. 
              The Federal Reserve continues to monitor these indicators closely for 
              monetary policy decisions.
            </p>
            <div className="summary-actions">
              <button className="btn btn-primary">Generate Report</button>
              <button className="btn btn-secondary">Export Data</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage