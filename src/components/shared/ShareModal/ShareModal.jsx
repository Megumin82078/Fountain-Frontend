import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Card from '../Card/Card';
import { useHealthNotifications } from '../NotificationSystem/NotificationSystem';
import { InlineSpinner } from '../LoadingState/LoadingState';
import styles from './ShareModal.module.css';

const shareSchema = yup.object({
  recipientName: yup
    .string()
    .required('Recipient name is required')
    .min(2, 'Name must be at least 2 characters'),
  recipientEmail: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  accessLevel: yup
    .string()
    .required('Please select an access level'),
  expirationDays: yup
    .number()
    .required('Please select expiration period')
    .min(1, 'Must be at least 1 day')
    .max(365, 'Cannot exceed 365 days'),
  message: yup
    .string()
    .max(500, 'Message must be less than 500 characters')
});

const ShareModal = ({ 
  isOpen, 
  onClose, 
  records = [], 
  title = 'Share Health Records' 
}) => {
  const notifications = useHealthNotifications();
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(shareSchema),
    defaultValues: {
      accessLevel: 'view',
      expirationDays: 30,
      message: ''
    }
  });

  const watchedValues = watch();

  const handleShare = async (data) => {
    setIsSharing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success notification
      notifications.showShareSuccess(data.recipientName);
      
      // Close modal and reset form
      handleClose();
      
    } catch (error) {
      notifications.showError('Failed to share records. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSharing(false);
    onClose();
  };

  const handleExport = async (format) => {
    const loadingId = notifications.showLoading(`Preparing ${format.toUpperCase()} export...`);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      notifications.removeNotification(loadingId);
      notifications.showSuccess(
        `Your health records have been exported as ${format.toUpperCase()}`,
        {
          title: 'Export Complete',
          actionLabel: 'Download',
          action: () => {
            // Simulate download
            const link = document.createElement('a');
            link.href = '#';
            link.download = `health-records.${format}`;
            link.click();
          }
        }
      );
    } catch (error) {
      notifications.removeNotification(loadingId);
      notifications.showError(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  };

  const accessLevels = [
    { value: 'view', label: 'View Only', description: 'Can view all shared records' },
    { value: 'limited', label: 'Limited Access', description: 'Can view basic information only' },
    { value: 'emergency', label: 'Emergency Access', description: 'Full access for emergency situations' }
  ];

  const exportFormats = [
    { format: 'pdf', label: 'PDF Document', icon: '📄', description: 'Formatted document with all records' },
    { format: 'xlsx', label: 'Excel Spreadsheet', icon: '📊', description: 'Structured data for analysis' },
    { format: 'json', label: 'JSON Data', icon: '💾', description: 'Raw data for technical use' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      className={styles.shareModal}
    >
      <div className={styles.modalContent}>
        {/* Share Method Tabs */}
        <div className={styles.methodTabs}>
          <button
            className={`${styles.methodTab} ${shareMethod === 'email' ? styles.active : ''}`}
            onClick={() => setShareMethod('email')}
          >
            📧 Share via Email
          </button>
          <button
            className={`${styles.methodTab} ${shareMethod === 'export' ? styles.active : ''}`}
            onClick={() => setShareMethod('export')}
          >
            📥 Export Files
          </button>
        </div>

        {/* Records Summary */}
        <Card className={styles.recordsSummary}>
          <h4>Records to Share ({records.length})</h4>
          <div className={styles.recordsList}>
            {records.length > 0 ? (
              records.map((record, index) => (
                <div key={index} className={styles.recordItem}>
                  <span className={styles.recordIcon}>📄</span>
                  <span className={styles.recordName}>{record.name || `Record ${index + 1}`}</span>
                  <span className={styles.recordDate}>{record.date}</span>
                </div>
              ))
            ) : (
              <p className={styles.noRecords}>No records selected</p>
            )}
          </div>
        </Card>

        {/* Email Share Form */}
        {shareMethod === 'email' && (
          <form onSubmit={handleSubmit(handleShare)} className={styles.shareForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Recipient Name"
                  {...register('recipientName')}
                  error={errors.recipientName?.message}
                  placeholder="Dr. Smith"
                />
              </div>
              <div className={styles.formGroup}>
                <Input
                  label="Email Address"
                  type="email"
                  {...register('recipientEmail')}
                  error={errors.recipientEmail?.message}
                  placeholder="doctor@example.com"
                />
              </div>
            </div>

            {/* Access Level */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Access Level</label>
              <div className={styles.accessLevels}>
                {accessLevels.map((level) => (
                  <label key={level.value} className={styles.accessLevel}>
                    <input
                      type="radio"
                      value={level.value}
                      {...register('accessLevel')}
                      className={styles.radio}
                    />
                    <div className={styles.accessContent}>
                      <h5>{level.label}</h5>
                      <p>{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.accessLevel && <span className={styles.error}>{errors.accessLevel.message}</span>}
            </div>

            {/* Expiration */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Access Expires In (Days)"
                  type="number"
                  min="1"
                  max="365"
                  {...register('expirationDays')}
                  error={errors.expirationDays?.message}
                />
              </div>
            </div>

            {/* Message */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Optional Message</label>
              <textarea
                {...register('message')}
                className={styles.textarea}
                placeholder="Add a personal message for the recipient..."
                rows="3"
              />
              {errors.message && <span className={styles.error}>{errors.message.message}</span>}
            </div>

            {/* Privacy Notice */}
            <div className={styles.privacyNotice}>
              <p>
                🔒 Your health records will be securely encrypted and shared with limited access.
                The recipient will receive an email with secure access instructions.
              </p>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSharing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSharing || records.length === 0}
              >
                {isSharing ? (
                  <>
                    <InlineSpinner size="small" />
                    Sharing...
                  </>
                ) : (
                  'Share Records'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Export Options */}
        {shareMethod === 'export' && (
          <div className={styles.exportSection}>
            <h4>Choose Export Format</h4>
            <div className={styles.exportOptions}>
              {exportFormats.map((option) => (
                <Card
                  key={option.format}
                  className={styles.exportOption}
                  onClick={() => handleExport(option.format)}
                >
                  <div className={styles.exportIcon}>{option.icon}</div>
                  <div className={styles.exportContent}>
                    <h5>{option.label}</h5>
                    <p>{option.description}</p>
                  </div>
                  <Button variant="ghost" size="small">
                    Export
                  </Button>
                </Card>
              ))}
            </div>

            <div className={styles.exportNote}>
              <p>
                📁 Exported files will include all selected records with metadata.
                Personal information is included for your own use.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;