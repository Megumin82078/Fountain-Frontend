import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import Input from '../../components/shared/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import LabResultsChart from '../../components/shared/LabResultsChart/LabResultsChart';
import styles from './HealthProfilePage.module.css';

const HealthProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conditions, medications, vitals, labs } = useHealthData();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedConditions, setExpandedConditions] = useState(new Set());
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  // Mock data - will be replaced with real API data
  const mockConditions = [
    {
      id: 1,
      name: 'Hypertension',
      icd10: 'I10',
      diagnosedDate: '2023-03-15',
      status: 'Active',
      severity: 'Moderate',
      managingPhysician: 'Dr. Sarah Johnson',
      medications: ['Lisinopril 10mg'],
      lastVisit: '2024-01-15',
      notes: 'Well controlled with medication. Blood pressure readings have been stable.',
      trend: 'stable'
    },
    {
      id: 2,
      name: 'Type 2 Diabetes Mellitus',
      icd10: 'E11.9',
      diagnosedDate: '2022-08-20',
      status: 'Active',
      severity: 'Mild',
      managingPhysician: 'Dr. Michael Chen',
      medications: ['Metformin 500mg'],
      lastVisit: '2024-01-10',
      notes: 'HbA1c levels improving with dietary changes and medication compliance.',
      trend: 'improving'
    },
    {
      id: 3,
      name: 'Seasonal Allergies',
      icd10: 'J30.1',
      diagnosedDate: '2020-05-10',
      status: 'Active',
      severity: 'Mild',
      managingPhysician: 'Dr. Emily Rodriguez',
      medications: ['Loratadine 10mg'],
      lastVisit: '2023-09-12',
      notes: 'Symptoms well managed during allergy season.',
      trend: 'stable'
    }
  ];

  const mockMedications = [
    {
      id: 1,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2023-03-15',
      prescribedBy: 'Dr. Sarah Johnson',
      purpose: 'Blood pressure control',
      status: 'Active',
      nextRefill: '2024-02-15',
      sideEffects: ['Dry cough (rare)', 'Dizziness'],
      instructions: 'Take with or without food, preferably in the morning'
    },
    {
      id: 2,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: '2022-08-20',
      prescribedBy: 'Dr. Michael Chen',
      purpose: 'Diabetes management',
      status: 'Active',
      nextRefill: '2024-02-20',
      sideEffects: ['GI upset', 'Metallic taste'],
      instructions: 'Take with meals to reduce stomach upset'
    },
    {
      id: 3,
      name: 'Loratadine',
      dosage: '10mg',
      frequency: 'Once daily (as needed)',
      startDate: '2023-04-01',
      prescribedBy: 'Dr. Emily Rodriguez',
      purpose: 'Allergy relief',
      status: 'Active',
      nextRefill: '2024-03-01',
      sideEffects: ['Drowsiness (minimal)', 'Dry mouth'],
      instructions: 'Take during allergy season or as symptoms occur'
    }
  ];

  const mockVitals = [
    { date: '2024-01-15', type: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'normal' },
    { date: '2024-01-15', type: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' },
    { date: '2024-01-15', type: 'Weight', value: '165', unit: 'lbs', status: 'normal' },
    { date: '2024-01-15', type: 'Temperature', value: '98.6', unit: '°F', status: 'normal' },
    { date: '2024-01-10', type: 'Blood Pressure', value: '135/88', unit: 'mmHg', status: 'elevated' },
    { date: '2024-01-10', type: 'Heart Rate', value: '68', unit: 'bpm', status: 'normal' },
  ];

  const mockLabs = [
    {
      id: 1,
      testName: 'Comprehensive Metabolic Panel',
      date: '2024-01-10',
      provider: 'City Lab',
      results: [
        { name: 'Glucose', value: '95', unit: 'mg/dL', referenceRange: '70-100', status: 'normal' },
        { name: 'BUN', value: '18', unit: 'mg/dL', referenceRange: '7-25', status: 'normal' },
        { name: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.6-1.3', status: 'normal' },
        { name: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '136-145', status: 'normal' }
      ]
    },
    {
      id: 2,
      testName: 'Lipid Panel',
      date: '2024-01-10',
      provider: 'City Lab',
      results: [
        { name: 'Total Cholesterol', value: '195', unit: 'mg/dL', referenceRange: '<200', status: 'normal' },
        { name: 'HDL', value: '45', unit: 'mg/dL', referenceRange: '>40', status: 'normal' },
        { name: 'LDL', value: '125', unit: 'mg/dL', referenceRange: '<130', status: 'normal' },
        { name: 'Triglycerides', value: '150', unit: 'mg/dL', referenceRange: '<150', status: 'borderline' }
      ]
    },
    {
      id: 3,
      testName: 'HbA1c',
      date: '2024-01-05',
      provider: 'City Lab',
      results: [
        { name: 'Hemoglobin A1c', value: '6.8', unit: '%', referenceRange: '<7.0', status: 'normal' }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'conditions', label: 'Conditions', icon: '🏥' },
    { id: 'medications', label: 'Medications', icon: '💊' },
    { id: 'vitals', label: 'Vitals', icon: '❤️' },
    { id: 'labs', label: 'Lab Results', icon: '🧪' }
  ];

  const toggleConditionExpansion = (conditionId) => {
    const newExpanded = new Set(expandedConditions);
    if (newExpanded.has(conditionId)) {
      newExpanded.delete(conditionId);
    } else {
      newExpanded.add(conditionId);
    }
    setExpandedConditions(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal': return 'var(--color-success)';
      case 'elevated':
      case 'borderline': return 'var(--color-warning)';
      case 'high':
      case 'abnormal': return 'var(--color-error)';
      default: return 'var(--color-gray-500)';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'worsening': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.healthProfile}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Health Profile</h1>
          <p className={styles.subtitle}>
            Complete overview of your health conditions, medications, and vital signs
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="secondary"
            onClick={() => navigate('/records')}
          >
            View Records
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate('/requests/new')}
          >
            Request Records
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.overviewGrid}>
              {/* Summary Cards */}
              <Card className={styles.summaryCard}>
                <h3 className={styles.cardTitle}>Active Conditions</h3>
                <div className={styles.cardValue}>{mockConditions.length}</div>
                <div className={styles.cardSubtext}>
                  {mockConditions.filter(c => c.status === 'Active').length} active
                </div>
              </Card>

              <Card className={styles.summaryCard}>
                <h3 className={styles.cardTitle}>Current Medications</h3>
                <div className={styles.cardValue}>{mockMedications.length}</div>
                <div className={styles.cardSubtext}>
                  All prescriptions up to date
                </div>
              </Card>

              <Card className={styles.summaryCard}>
                <h3 className={styles.cardTitle}>Recent Lab Results</h3>
                <div className={styles.cardValue}>{mockLabs.length}</div>
                <div className={styles.cardSubtext}>
                  Last updated {formatDate('2024-01-10')}
                </div>
              </Card>

              <Card className={styles.summaryCard}>
                <h3 className={styles.cardTitle}>Risk Factors</h3>
                <div className={styles.cardValue}>2</div>
                <div className={styles.cardSubtext}>
                  Hypertension, Diabetes
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className={styles.activityCard}>
              <h3 className={styles.cardTitle}>Recent Health Activity</h3>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>🧪</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Lab Results Updated</div>
                    <div className={styles.activityDate}>January 10, 2024</div>
                  </div>
                  <div className={styles.activityStatus}>
                    <span className={styles.statusNormal}>Normal</span>
                  </div>
                </div>
                
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>❤️</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Blood Pressure Check</div>
                    <div className={styles.activityDate}>January 15, 2024</div>
                  </div>
                  <div className={styles.activityStatus}>
                    <span className={styles.statusNormal}>128/82 mmHg</span>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>💊</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Medication Refill Due</div>
                    <div className={styles.activityDate}>February 15, 2024</div>
                  </div>
                  <div className={styles.activityStatus}>
                    <span className={styles.statusWarning}>Due Soon</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Conditions Tab */}
        {activeTab === 'conditions' && (
          <div className={styles.conditions}>
            {mockConditions.map((condition) => (
              <Card key={condition.id} className={styles.conditionCard}>
                <div className={styles.conditionHeader}>
                  <div className={styles.conditionTitle}>
                    <h3>{condition.name}</h3>
                    <span className={styles.icdCode}>ICD-10: {condition.icd10}</span>
                  </div>
                  <div className={styles.conditionMeta}>
                    <span className={`${styles.status} ${styles[condition.status.toLowerCase()]}`}>
                      {condition.status}
                    </span>
                    <span className={styles.trend}>{getTrendIcon(condition.trend)}</span>
                  </div>
                </div>

                <div className={styles.conditionSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Diagnosed:</span>
                    <span className={styles.value}>{formatDate(condition.diagnosedDate)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Severity:</span>
                    <span className={styles.value}>{condition.severity}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Managing Physician:</span>
                    <span className={styles.value}>{condition.managingPhysician}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Last Visit:</span>
                    <span className={styles.value}>{formatDate(condition.lastVisit)}</span>
                  </div>
                </div>

                {expandedConditions.has(condition.id) && (
                  <div className={styles.conditionDetails}>
                    <div className={styles.detailSection}>
                      <h4>Current Medications</h4>
                      <ul>
                        {condition.medications.map((med, index) => (
                          <li key={index}>{med}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.detailSection}>
                      <h4>Notes</h4>
                      <p>{condition.notes}</p>
                    </div>
                  </div>
                )}

                <button
                  className={styles.expandButton}
                  onClick={() => toggleConditionExpansion(condition.id)}
                >
                  {expandedConditions.has(condition.id) ? 'Show Less' : 'Show More'}
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className={styles.medications}>
            {mockMedications.map((medication) => (
              <Card key={medication.id} className={styles.medicationCard}>
                <div className={styles.medicationHeader}>
                  <div className={styles.medicationInfo}>
                    <h3 className={styles.medicationName}>{medication.name}</h3>
                    <p className={styles.medicationDosage}>{medication.dosage} - {medication.frequency}</p>
                  </div>
                  <div className={styles.medicationStatus}>
                    <span className={`${styles.status} ${styles.active}`}>
                      {medication.status}
                    </span>
                  </div>
                </div>

                <div className={styles.medicationDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Purpose:</span>
                    <span className={styles.value}>{medication.purpose}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Prescribed by:</span>
                    <span className={styles.value}>{medication.prescribedBy}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Start Date:</span>
                    <span className={styles.value}>{formatDate(medication.startDate)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Next Refill:</span>
                    <span className={styles.value}>{formatDate(medication.nextRefill)}</span>
                  </div>
                </div>

                <div className={styles.medicationInstructions}>
                  <h4>Instructions</h4>
                  <p>{medication.instructions}</p>
                </div>

                <div className={styles.sideEffects}>
                  <h4>Common Side Effects</h4>
                  <div className={styles.sideEffectsList}>
                    {medication.sideEffects.map((effect, index) => (
                      <span key={index} className={styles.sideEffect}>
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className={styles.vitals}>
            <div className={styles.vitalsHeader}>
              <h3>Vital Signs History</h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={styles.timeframeSelect}
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className={styles.vitalsGrid}>
              {mockVitals.map((vital, index) => (
                <Card key={index} className={styles.vitalCard}>
                  <div className={styles.vitalHeader}>
                    <h4 className={styles.vitalType}>{vital.type}</h4>
                    <span 
                      className={styles.vitalStatus}
                      style={{ color: getStatusColor(vital.status) }}
                    >
                      {vital.status}
                    </span>
                  </div>
                  <div className={styles.vitalValue}>
                    {vital.value}
                    <span className={styles.vitalUnit}>{vital.unit}</span>
                  </div>
                  <div className={styles.vitalDate}>
                    {formatDate(vital.date)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Labs Tab */}
        {activeTab === 'labs' && (
          <div className={styles.labs}>
            <LabResultsChart
              labResults={mockLabs}
              title="Laboratory Results"
              showTrends={true}
            />
            
            {/* Individual Lab Cards */}
            <div className={styles.labCards}>
              {mockLabs.map((lab) => (
                <Card key={lab.id} className={styles.labCard}>
                  <div className={styles.labHeader}>
                    <div className={styles.labInfo}>
                      <h3 className={styles.labName}>{lab.testName}</h3>
                      <p className={styles.labMeta}>
                        {lab.provider} • {formatDate(lab.date)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate('/records')}
                    >
                      View Report
                    </Button>
                  </div>

                  <div className={styles.labResults}>
                    {lab.results.map((result, index) => (
                      <div key={index} className={styles.resultRow}>
                        <div className={styles.resultName}>{result.name}</div>
                        <div className={styles.resultValue}>
                          <span className={styles.value}>{result.value}</span>
                          <span className={styles.unit}>{result.unit}</span>
                        </div>
                        <div className={styles.resultRange}>
                          Range: {result.referenceRange}
                        </div>
                        <div 
                          className={styles.resultStatus}
                          style={{ color: getStatusColor(result.status) }}
                        >
                          {result.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthProfilePage;