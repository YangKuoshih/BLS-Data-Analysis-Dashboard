import React, { useState } from 'react'
import { Card, Grid } from '../components/UI'

const ExportPage: React.FC = () => {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const indicators = [
    { id: 'cpi', name: 'Consumer Price Index', icon: '📈' },
    { id: 'ppi', name: 'Producer Price Index', icon: '🏭' },
    { id: 'unemployment', name: 'Unemployment Rate', icon: '👥' },
    { id: 'employment', name: 'Employment Statistics', icon: '💼' },
    { id: 'labor-force', name: 'Labor Force Participation', icon: '👷' },
    { id: 'wages', name: 'Average Hourly Earnings', icon: '💰' }
  ]

  const handleIndicatorToggle = (indicatorId: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicatorId)
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    )
  }

  const handleSelectAll = () => {
    setSelectedIndicators(indicators.map(i => i.id))
  }

  const handleClearAll = () => {
    setSelectedIndicators([])
  }

  const handleExport = () => {
    // Export functionality will be implemented in later tasks
    console.log('Export requested:', {
      indicators: selectedIndicators,
      format: exportFormat,
      dateRange
    })
    alert('Export functionality will be implemented in upcoming tasks')
  }

  return (
    <div className="export-page">
      <div className="page-header">
        <h1>Data Export</h1>
        <p>Export economic indicator data for external analysis</p>
      </div>

      <Grid columns={2} gap="lg">
        <Card title="Select Indicators" variant="elevated">
          <div className="indicator-selection">
            <div className="selection-controls">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleSelectAll}
              >
                Select All
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
            
            <div className="indicator-list">
              {indicators.map((indicator) => (
                <label key={indicator.id} className="indicator-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIndicators.includes(indicator.id)}
                    onChange={() => handleIndicatorToggle(indicator.id)}
                  />
                  <span className="checkbox-content">
                    <span className="indicator-icon">{indicator.icon}</span>
                    <span className="indicator-name">{indicator.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Export Options" variant="elevated">
          <div className="export-options">
            <div className="option-group">
              <label className="option-label">Export Format</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  />
                  <span>CSV Format</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={(e) => setExportFormat(e.target.value as 'excel')}
                  />
                  <span>Excel Format</span>
                </label>
              </div>
            </div>

            <div className="option-group">
              <label className="option-label">Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </Card>
      </Grid>

      <Card title="Export Summary" variant="outlined">
        <div className="export-summary">
          <div className="summary-info">
            <p><strong>Selected Indicators:</strong> {selectedIndicators.length} of {indicators.length}</p>
            <p><strong>Export Format:</strong> {exportFormat.toUpperCase()}</p>
            <p><strong>Date Range:</strong> {dateRange.startDate || 'Not specified'} to {dateRange.endDate || 'Not specified'}</p>
          </div>
          
          <div className="export-actions">
            <button 
              className="btn btn-primary"
              onClick={handleExport}
              disabled={selectedIndicators.length === 0}
            >
              Export Data
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ExportPage