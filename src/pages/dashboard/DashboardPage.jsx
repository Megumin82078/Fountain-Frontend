import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useRequests } from '../../contexts/RequestContext';
import { useHealthNotifications } from '../../components/shared/NotificationSystem/NotificationSystem';
import LoadingState, { SkeletonLoader } from '../../components/shared/LoadingState/LoadingState';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alerts, vitals, dismissAlert } = useHealthData();
  const { activeRequests } = useRequests();
  const notifications = useHealthNotifications();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Removed intrusive welcome notification - better UX
    }, 800);  // Faster loading

    return () => clearTimeout(timer);
  }, []);

  // Mock data - will be replaced with real API data
  const mockVitals = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', trend: 'stable' },
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'down' },
    { label: 'Weight', value: '165', unit: 'lbs', trend: 'stable' },
    { label: 'Temperature', value: '98.6', unit: '°F', trend: 'stable' }
  ];

  const mockAlerts = [
    {
      id: 1,
      type: 'high',
      message: 'Blood pressure reading is elevated. Consider consulting your doctor.',
      time: '2 hours ago',
      icon: '⚠️'
    },
    {
      id: 2,
      type: 'medium',
      message: 'Lab results from Dr. Smith are now available.',
      time: '1 day ago',
      icon: '📋'
    },
    {
      id: 3,
      type: 'info',
      message: 'Your annual checkup reminder is due next week.',
      time: '3 days ago',
      icon: '📅'
    }
  ];

  const mockNotes = [
    {
      id: 1,
      provider: 'Dr. Sarah Johnson',
      date: '2 days ago',
      content: 'Patient reports feeling well overall. Blood pressure slightly elevated, recommend monitoring. Continue current medications.',
      expanded: false
    },
    {
      id: 2,
      provider: 'Dr. Michael Chen',
      date: '1 week ago',
      content: 'Annual physical exam completed. All vitals within normal range. Recommended annual lab work scheduled.',
      expanded: false
    },
    {
      id: 3,
      provider: 'Dr. Emily Rodriguez',
      date: '2 weeks ago',
      content: 'Follow-up for recent symptoms. Patient responding well to treatment plan. Continue current course.',
      expanded: false
    }
  ];

  const mockRequests = [
    {
      id: 1,
      provider: 'City General Hospital',
      date: '3 days ago',
      status: 'processing'
    },
    {
      id: 2,
      provider: 'Dr. Smith\'s Office',
      date: '1 week ago',
      status: 'completed'
    },
    {
      id: 3,
      provider: 'Memorial Clinic',
      date: '2 weeks ago',
      status: 'pending'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleNoteExpansion = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getStatusBadgeClass = (status) => {
    return `${styles.statusBadge} ${styles[status]}`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  // Demonstration functions for notifications
  const handleQuickDemo = () => {
    notifications.showMedicationReminder('Lisinopril', 3);
    setTimeout(() => {
      notifications.showLabResultsAvailable('Comprehensive Metabolic Panel');
    }, 2000);
  };

  const handleRecordsDemo = () => {
    const loadingId = notifications.showLoading('Fetching your medical records...');
    setTimeout(() => {
      notifications.removeNotification(loadingId);
      notifications.showRecordUploaded('Annual Physical Exam Report');
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <LoadingState 
          message="Loading your health dashboard..."
          icon="🏥"
          size="large"
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {getGreeting()}, {user?.first_name || 'User'}
        </h1>
        <p className={styles.date}>{formatDate()}</p>
        
        <div className={styles.quickActions}>
          <Button 
            variant="primary" 
            onClick={() => navigate('/requests/new')}
          >
            New Request
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleRecordsDemo}
          >
            View Records
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile/health')}
          >
            Health Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={handleQuickDemo}
            className={styles.demoButton}
          >
            📱 Try Notifications
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          {/* Request Status Card */}
          <Card className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h2 className={styles.statusTitle}>Active Requests</h2>
              <Button 
                variant="ghost" 
                size="small"
                onClick={() => navigate('/requests')}
              >
                View All
              </Button>
            </div>
            <div className={styles.statusList}>
              {mockRequests.length > 0 ? (
                mockRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className={styles.statusItem}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <div className={styles.statusInfo}>
                      <div className={styles.statusProvider}>{request.provider}</div>
                      <div className={styles.statusDate}>Requested {request.date}</div>
                    </div>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📋</div>
                  <h3 className={styles.emptyTitle}>No Active Requests</h3>
                  <p className={styles.emptyDescription}>
                    Start by requesting your medical records from a provider
                  </p>
                  <Button onClick={() => navigate('/requests/new')}>
                    Create Request
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Vitals Trend Card */}
          <Card className={styles.vitalsCard}>
            <div className={styles.vitalsHeader}>
              <h2 className={styles.vitalsTitle}>Vitals Trend</h2>
              <div className={styles.periodSelector}>
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ''}`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.vitalsGrid}>
              {mockVitals.map((vital, index) => (
                <div key={index} className={styles.vitalItem}>
                  <div className={styles.vitalValue}>
                    {vital.value}
                    <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '4px' }}>
                      {vital.unit}
                    </span>
                  </div>
                  <div className={styles.vitalLabel}>{vital.label}</div>
                  <div className={`${styles.vitalTrend} ${styles[vital.trend]}`}>
                    {getTrendIcon(vital.trend)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Doctor Notes */}
          <Card className={styles.notesCard}>
            <div className={styles.statusHeader}>
              <h2 className={styles.statusTitle}>Recent Doctor Notes</h2>
              <Button 
                variant="ghost" 
                size="small"
                onClick={() => navigate('/records')}
              >
                View All
              </Button>
            </div>
            <div className={styles.notesList}>
              {mockNotes.slice(0, 3).map((note) => (
                <div key={note.id} className={styles.noteItem}>
                  <div className={styles.noteHeader}>
                    <span className={styles.noteProvider}>{note.provider}</span>
                    <span className={styles.noteDate}>{note.date}</span>
                  </div>
                  <div className={styles.noteContent}>
                    {expandedNotes.has(note.id) 
                      ? note.content 
                      : `${note.content.substring(0, 100)}...`
                    }
                    <button 
                      className={styles.expandButton}
                      onClick={() => toggleNoteExpansion(note.id)}
                    >
                      {expandedNotes.has(note.id) ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.sidebar}>
          {/* Health Alerts */}
          <Card className={styles.alertsCard}>
            <div className={styles.alertsHeader}>
              <h2 className={styles.statusTitle}>Health Alerts</h2>
              <Button 
                variant="ghost" 
                size="small"
                onClick={() => navigate('/alerts')}
              >
                View All
              </Button>
            </div>
            <div className={styles.alertsList}>
              {mockAlerts.length > 0 ? (
                mockAlerts.map((alert) => (
                  <div key={alert.id} className={`${styles.alertItem} ${styles[alert.type]}`}>
                    <span className={styles.alertIcon}>{alert.icon}</span>
                    <div className={styles.alertContent}>
                      <div className={styles.alertMessage}>{alert.message}</div>
                      <div className={styles.alertTime}>{alert.time}</div>
                    </div>
                    <button 
                      className={styles.dismissButton}
                      onClick={() => dismissAlert(alert.id)}
                      aria-label="Dismiss alert"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✅</div>
                  <p className={styles.emptyDescription}>No alerts</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;