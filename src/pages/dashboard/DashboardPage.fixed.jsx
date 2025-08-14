import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { useHealthData } from '../../hooks/useHealthData';
import { useDashboard } from '../../hooks/useApi';
import apiService from '../../services/api';
import { 
  Button, 
  Card, 
  StatCard,
  HealthCard,
  Badge, 
  Alert,
  LoadingSpinner
} from '../../components/common';
import { 
  ChevronRightIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { state, dispatch } = useApp();
  const { getHealthSummary, getAbnormalResults, fetchAllHealthData } = useHealthData();
  const { fetchDashboard, loading: dashboardLoading } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardDetail, setDashboardDetail] = useState(null);
  const [error, setError] = useState(null);

  // AI Report will come from backend when available
  const [aiReport, setAiReport] = useState({
    loading: false,
    lastUpdated: new Date().toISOString(),
    summary: null,
    recommendations: [],
    riskFactors: []
  });

  // Fetch real dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [healthData, dashboardResult] = await Promise.all([
          fetchAllHealthData(true),
          fetchDashboard()
        ]);

        if (dashboardResult) {
          setDashboardData(dashboardResult.dashboard);
          setDashboardDetail(dashboardResult.detail);
        }

        // Try to fetch AI health advice if available
        try {
          const healthAdvice = await apiService.getHealthAdvice();
          if (healthAdvice) {
            setAiReport(prev => ({
              ...prev,
              summary: healthAdvice.summary || null,
              recommendations: healthAdvice.recommendations || [],
              lastUpdated: new Date().toISOString()
            }));
          }
        } catch (adviceError) {
          console.log('Health advice not available yet');
        }

      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Get real-time calculations
  const healthSummary = getHealthSummary();
  const abnormalResults = getAbnormalResults();

  // Calculate stats from real data
  const quickStats = [
    {
      title: 'Active Conditions',
      value: healthSummary.activeConditions,
      total: state.healthData.conditions.length,
      variant: 'primary',
      trend: dashboardData?.conditions_trend || 'No changes'
    },
    {
      title: 'Current Medications',
      value: healthSummary.currentMedications,
      total: state.healthData.medications.length,
      variant: 'success',
      trend: dashboardData?.medications_trend || 'No changes'
    },
    {
      title: 'Recent Lab Results',
      value: state.healthData.labs.filter(l => {
        const date = new Date(l.observed || l.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      }).length,
      total: state.healthData.labs.length,
      variant: 'warning',
      trend: dashboardData?.labs_trend || 'No new results'
    },
    {
      title: 'Unread Alerts',
      value: state.alerts.unreadCount,
      total: state.alerts.list.length,
      variant: 'error',
      trend: abnormalResults.total > 0 ? `${abnormalResults.total} need attention` : 'All normal'
    }
  ];

  const handleDownloadReport = async () => {
    try {
      // Use real user data
      const userProfile = state.auth.user || {};
      
      const reportContent = `
FOUNTAIN MEDICAL REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

=== MEDICAL SUMMARY ===
Patient Name: ${userProfile.name || userProfile.email || 'Patient'}
Patient ID: ${userProfile.id || 'N/A'}
Report Type: Comprehensive Health Summary

=== CONDITIONS ===
Total Conditions: ${state.healthData.conditions.length}
${state.healthData.conditions.map(condition => 
  `- ${condition.disease?.name || 'Unknown'} (Status: ${condition.clinical_status}, Since: ${new Date(condition.onset_date).toLocaleDateString()})`
).join('\n') || 'No conditions on record'}

=== MEDICATIONS ===
Total Medications: ${state.healthData.medications.length}
${state.healthData.medications.map(med => 
  `- ${med.label} ${med.dose}${med.unit} - ${med.frequency} (Started: ${new Date(med.start_date).toLocaleDateString()})`
).join('\n') || 'No medications on record'}

=== LAB RESULTS ===
Total Lab Results: ${state.healthData.labs.length}
${state.healthData.labs.map(lab => 
  `- ${lab.fact?.label || 'Unknown'}: ${lab.value} ${lab.fact?.unit || ''} (${isAbnormalLabResult(lab) ? 'ABNORMAL' : 'Normal'}) - ${new Date(lab.observed).toLocaleDateString()}`
).join('\n') || 'No lab results on record'}

=== VITAL SIGNS ===
Total Vitals: ${state.healthData.vitals.length}
${state.healthData.vitals.map(vital => 
  `- ${vital.fact?.label || 'Unknown'}: ${vital.value} ${vital.fact?.unit || ''} ${isAbnormalVital(vital) ? '(ABNORMAL)' : ''} - ${new Date(vital.observed).toLocaleDateString()}`
).join('\n') || 'No vital signs on record'}

=== PROCEDURES ===
Total Procedures: ${state.healthData.procedures.length}
${state.healthData.procedures.map(proc => 
  `- ${proc.label} - ${new Date(proc.date).toLocaleDateString()}`
).join('\n') || 'No procedures on record'}

This medical report was generated by Fountain Healthcare Platform.
For official medical records, please contact your healthcare provider.
    `.trim();

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fountain-medical-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Medical report downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  // Helper functions for checking abnormal values
  const isAbnormalLabResult = (lab) => {
    if (!lab.fact || lab.fact.ref_low === null || lab.fact.ref_high === null) return false;
    return lab.value < lab.fact.ref_low || lab.value > lab.fact.ref_high;
  };

  const isAbnormalVital = (vital) => {
    if (!vital.fact || vital.fact.ref_low === null || vital.fact.ref_high === null) return false;
    return vital.value < vital.fact.ref_low || vital.value > vital.fact.ref_high;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="content-container">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="content-container">
          <Alert
            variant="error"
            title="Failed to load dashboard"
            message={error}
            actions={[
              <Button
                key="retry"
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            ]}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="content-container">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Welcome back{state.auth.user?.name ? `, ${state.auth.user.name}` : ''}
              </h1>
              <p className="text-neutral-600">
                Here's an overview of your health information
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadReport}
              >
                Download Full Medical Report
              </Button>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="space-y-6">
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={`of ${stat.total} total`}
                variant={stat.variant}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Warning if any abnormal results */}
          {abnormalResults.total > 0 && (
            <Alert
              variant="warning"
              title="Abnormal Results Detected"
              message={`${abnormalResults.total} test results require your attention`}
              className="border-l-4 border-warning-500"
              actions={[
                <Button
                  key="view"
                  variant="warning"
                  size="sm"
                  onClick={() => window.location.href = '/health-records/labs'}
                >
                  Review Results
                </Button>
              ]}
            />
          )}

          {/* Dashboard detail from backend */}
          {dashboardDetail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Health Summary">
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600">
                    Last updated: {new Date(healthSummary.lastUpdated || Date.now()).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-neutral-500">Total Records</span>
                      <p className="text-2xl font-bold">{healthSummary.totalRecords}</p>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500">Recent Activity</span>
                      <p className="text-2xl font-bold">{healthSummary.recentActivity}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI insights - only show if available from backend */}
              {aiReport.summary && (
                <Card 
                  title={
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <SparklesIcon className="w-5 h-5 text-primary-600" />
                      <span>Health Insights</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {aiReport.summary.healthScore && (
                      <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary-900">Health Score</span>
                        </div>
                        <div className="flex items-end space-x-2">
                          <span className="text-3xl font-bold text-primary-900">
                            {aiReport.summary.healthScore}
                          </span>
                          <span className="text-lg text-primary-700 mb-1">/100</span>
                        </div>
                      </div>
                    )}

                    {aiReport.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {aiReport.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span className="text-sm text-neutral-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* No data message */}
          {state.healthData.conditions.length === 0 && 
           state.healthData.medications.length === 0 && 
           state.healthData.labs.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No Health Records Yet
                </h3>
                <p className="text-neutral-600 mb-4">
                  Start adding your health information to see insights and recommendations
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/health-records/conditions'}
                >
                  Add Health Records
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;