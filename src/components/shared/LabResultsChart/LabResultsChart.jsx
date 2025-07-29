import React, { useState } from 'react';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './LabResultsChart.module.css';

const LabResultsChart = ({ 
  labResults = [], 
  title = "Lab Results",
  showTrends = true,
  compact = false 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedTest, setSelectedTest] = useState('all');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  const timeframes = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Mock trend data for demonstration
  const mockTrendData = {
    'Glucose': [
      { date: '2023-08-15', value: 98, status: 'normal' },
      { date: '2023-11-15', value: 102, status: 'normal' },
      { date: '2024-01-10', value: 95, status: 'normal' }
    ],
    'Cholesterol': [
      { date: '2023-08-15', value: 210, status: 'elevated' },
      { date: '2023-11-15', value: 198, status: 'normal' },
      { date: '2024-01-10', value: 195, status: 'normal' }
    ],
    'HbA1c': [
      { date: '2023-08-15', value: 7.2, status: 'elevated' },
      { date: '2023-11-15', value: 6.9, status: 'normal' },
      { date: '2024-01-10', value: 6.8, status: 'normal' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal': return 'var(--color-success)';
      case 'low': return 'var(--color-warning)';
      case 'high':
      case 'elevated':
      case 'abnormal': return 'var(--color-error)';
      case 'borderline': return 'var(--color-warning)';
      default: return 'var(--color-gray-500)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal': return '✅';
      case 'low': return '⬇️';
      case 'high':
      case 'elevated':
      case 'abnormal': return '⬆️';
      case 'borderline': return '⚠️';
      default: return '➡️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatValue = (value, unit) => {
    return `${value} ${unit || ''}`.trim();
  };

  const getTrendDirection = (testName) => {
    const trends = mockTrendData[testName];
    if (!trends || trends.length < 2) return 'stable';
    
    const latest = trends[trends.length - 1].value;
    const previous = trends[trends.length - 2].value;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  // Group results by test name for trend analysis
  const groupedResults = labResults.reduce((acc, lab) => {
    lab.results?.forEach(result => {
      if (!acc[result.name]) {
        acc[result.name] = [];
      }
      acc[result.name].push({
        ...result,
        date: lab.date,
        provider: lab.provider
      });
    });
    return acc;
  }, {});

  const uniqueTests = Object.keys(groupedResults);

  return (
    <Card className={`${styles.labChart} ${compact ? styles.compact : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {labResults.length > 0 && (
            <p className={styles.subtitle}>
              Latest results from {formatDate(labResults[0]?.date)}
            </p>
          )}
        </div>
        
        {!compact && (
          <div className={styles.controls}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleButton} ${viewMode === 'chart' ? styles.active : ''}`}
                onClick={() => setViewMode('chart')}
              >
                📊 Chart
              </button>
              <button
                className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
                onClick={() => setViewMode('table')}
              >
                📋 Table
              </button>
            </div>
            
            {showTrends && (
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={styles.timeframeSelect}
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {labResults.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧪</div>
          <h4>No Lab Results</h4>
          <p>Lab results will appear here once available</p>
        </div>
      ) : viewMode === 'chart' ? (
        <div className={styles.chartView}>
          {/* Quick Stats */}
          <div className={styles.quickStats}>
            {labResults[0]?.results?.slice(0, 4).map((result, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statName}>{result.name}</span>
                  <span 
                    className={styles.statStatus}
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {getStatusIcon(result.status)}
                  </span>
                </div>
                <div className={styles.statValue}>
                  {formatValue(result.value, result.unit)}
                </div>
                <div className={styles.statRange}>
                  Range: {result.referenceRange}
                </div>
                {showTrends && (
                  <div className={styles.statTrend}>
                    {getTrendIcon(getTrendDirection(result.name))} Trend
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trend Visualization */}
          {showTrends && (
            <div className={styles.trendsSection}>
              <h4>Trends Over Time</h4>
              <div className={styles.trendCharts}>
                {Object.entries(mockTrendData).slice(0, 3).map(([testName, trends]) => (
                  <div key={testName} className={styles.trendChart}>
                    <div className={styles.chartHeader}>
                      <span className={styles.chartTitle}>{testName}</span>
                      <span className={styles.chartTrend}>
                        {getTrendIcon(getTrendDirection(testName))}
                      </span>
                    </div>
                    <div className={styles.chartArea}>
                      <div className={styles.chartPlaceholder}>
                        <div className={styles.chartLine}>
                          {trends.map((point, index) => (
                            <div
                              key={index}
                              className={styles.chartPoint}
                              style={{
                                left: `${(index / (trends.length - 1)) * 100}%`,
                                backgroundColor: getStatusColor(point.status)
                              }}
                              title={`${formatDate(point.date)}: ${point.value}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className={styles.chartLabels}>
                        <span>{formatDate(trends[0]?.date)}</span>
                        <span>{formatDate(trends[trends.length - 1]?.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.tableView}>
          {labResults.map((lab, labIndex) => (
            <div key={labIndex} className={styles.labGroup}>
              <div className={styles.labHeader}>
                <h4>{lab.testName}</h4>
                <div className={styles.labMeta}>
                  <span>{lab.provider}</span>
                  <span>•</span>
                  <span>{formatDate(lab.date)}</span>
                </div>
              </div>
              
              <div className={styles.resultsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.column}>Test</div>
                  <div className={styles.column}>Result</div>
                  <div className={styles.column}>Range</div>
                  <div className={styles.column}>Status</div>
                  {showTrends && <div className={styles.column}>Trend</div>}
                </div>
                
                {lab.results?.map((result, index) => (
                  <div key={index} className={styles.tableRow}>
                    <div className={styles.column}>
                      <span className={styles.testName}>{result.name}</span>
                    </div>
                    <div className={styles.column}>
                      <span className={styles.resultValue}>
                        {formatValue(result.value, result.unit)}
                      </span>
                    </div>
                    <div className={styles.column}>
                      <span className={styles.referenceRange}>
                        {result.referenceRange}
                      </span>
                    </div>
                    <div className={styles.column}>
                      <span 
                        className={styles.status}
                        style={{ color: getStatusColor(result.status) }}
                      >
                        {getStatusIcon(result.status)} {result.status}
                      </span>
                    </div>
                    {showTrends && (
                      <div className={styles.column}>
                        <span className={styles.trend}>
                          {getTrendIcon(getTrendDirection(result.name))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {!compact && labResults.length > 0 && (
        <div className={styles.footer}>
          <Button variant="ghost" size="small">
            📊 View Detailed Analysis
          </Button>
          <Button variant="ghost" size="small">
            📤 Export Results
          </Button>
          <Button variant="ghost" size="small">
            📋 Compare with Previous
          </Button>
        </div>
      )}
    </Card>
  );
};

export default LabResultsChart;