import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import Input from '../../components/shared/Input/Input';
import Modal from '../../components/shared/Modal/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from '../../contexts/RequestContext';
import { useUI } from '../../contexts/UIContext';
import styles from './NewRequestPage.module.css';

const schema = yup.object({
  requestTitle: yup
    .string()
    .required('Request title is required')
    .min(5, 'Title must be at least 5 characters'),
  dateRange: yup.object({
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable()
  }),
  specificRecords: yup.array().of(yup.string()),
  specialInstructions: yup.string().max(500, 'Instructions must be less than 500 characters')
});

const NewRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRequest, isLoading } = useRequests();
  const { showSuccess, showError } = useUI();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isCustomProviderOpen, setIsCustomProviderOpen] = useState(false);
  const [customProvider, setCustomProvider] = useState({
    name: '',
    phone: '',
    fax: '',
    email: '',
    address: '',
    contact: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      requestTitle: '',
      dateRange: { startDate: null, endDate: null },
      specificRecords: [],
      specialInstructions: ''
    }
  });

  // Mock provider data - will be replaced with real API search
  const mockProviders = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Medical Center Dr, Springfield, IL 62701',
      phone: '(555) 123-4567',
      type: 'hospital',
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics'],
      doctors: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez']
    },
    {
      id: 2,
      name: 'Springfield Family Practice',
      address: '456 Main St, Springfield, IL 62701',
      phone: '(555) 234-5678',
      type: 'clinic',
      specialties: ['Family Medicine', 'Pediatrics'],
      doctors: ['Dr. Robert Smith', 'Dr. Lisa Williams']
    },
    {
      id: 3,
      name: 'Advanced Cardiology Associates',
      address: '789 Heart Ave, Springfield, IL 62701',
      phone: '(555) 345-6789',
      type: 'specialty',
      specialties: ['Cardiology', 'Cardiac Surgery'],
      doctors: ['Dr. David Miller', 'Dr. Jennifer Davis']
    },
    {
      id: 4,
      name: 'Metro Lab Services',
      address: '321 Lab St, Springfield, IL 62701',
      phone: '(555) 456-7890',
      type: 'lab',
      specialties: ['Laboratory Services', 'Pathology'],
      doctors: []
    },
    {
      id: 5,
      name: 'Women\'s Health Center',
      address: '654 Wellness Blvd, Springfield, IL 62701',
      phone: '(555) 567-8901',
      type: 'specialty',
      specialties: ['Gynecology', 'Obstetrics'],
      doctors: ['Dr. Maria Garcia', 'Dr. Amanda Taylor']
    }
  ];

  const recordTypes = [
    'Medical Records',
    'Lab Results',
    'Imaging Studies',
    'Surgical Records',
    'Immunization Records',
    'Prescription History',
    'Discharge Summaries',
    'Progress Notes',
    'Consultation Reports',
    'Pathology Reports'
  ];

  const steps = [
    { number: 1, title: 'Select Providers', description: 'Choose healthcare providers' },
    { number: 2, title: 'Request Details', description: 'Specify what records you need' },
    { number: 3, title: 'Review & Submit', description: 'Confirm your request' }
  ];

  const filteredProviders = mockProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    provider.doctors.some(doctor => 
      doctor.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleProviderSelect = (provider) => {
    const isSelected = selectedProviders.find(p => p.id === provider.id);
    if (isSelected) {
      setSelectedProviders(selectedProviders.filter(p => p.id !== provider.id));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleCustomProviderAdd = () => {
    if (customProvider.name.trim()) {
      const newProvider = {
        id: `custom_${Date.now()}`,
        ...customProvider,
        type: 'custom',
        specialties: [],
        doctors: customProvider.contact ? [customProvider.contact] : []
      };
      setSelectedProviders([...selectedProviders, newProvider]);
      setCustomProvider({
        name: '',
        phone: '',
        fax: '',
        email: '',
        address: '',
        contact: ''
      });
      setIsCustomProviderOpen(false);
      showSuccess('Custom provider added successfully');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedProviders.length === 0) {
      showError('Please select at least one healthcare provider');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data) => {
    try {
      const requestData = {
        title: data.requestTitle,
        providers: selectedProviders.map(provider => ({
          id: provider.id.toString().startsWith('custom_') ? undefined : provider.id,
          name: provider.name,
          phone: provider.phone,
          fax: provider.fax,
          email: provider.email,
          contact: provider.contact,
          doctors: provider.doctors
        })),
        dateRange: data.dateRange,
        specificRecords: data.specificRecords,
        specialInstructions: data.specialInstructions
      };

      await createRequest(requestData);
      showSuccess('Request submitted successfully! You will receive updates via email.');
      navigate('/dashboard');
    } catch (error) {
      showError('Failed to submit request. Please try again.');
    }
  };

  const getProviderIcon = (type) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'clinic': return '🏪';
      case 'specialty': return '🩺';
      case 'lab': return '🧪';
      case 'custom': return '📋';
      default: return '🏥';
    }
  };

  return (
    <div className={styles.newRequestPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>New Health Records Request</h1>
          <p className={styles.subtitle}>
            Request your medical records from healthcare providers
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        {steps.map((step) => (
          <div
            key={step.number}
            className={`${styles.step} ${
              currentStep === step.number ? styles.active :
              currentStep > step.number ? styles.completed : ''
            }`}
          >
            <div className={styles.stepNumber}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepDescription}>{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={styles.stepContent}>
        {/* Step 1: Provider Selection */}
        {currentStep === 1 && (
          <div className={styles.providerSelection}>
            <Card className={styles.searchCard}>
              <div className={styles.searchSection}>
                <Input
                  placeholder="Search providers, specialties, or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => setIsCustomProviderOpen(true)}
                >
                  Add Custom Provider
                </Button>
              </div>
            </Card>

            {/* Selected Providers */}
            {selectedProviders.length > 0 && (
              <Card className={styles.selectedProviders}>
                <h3>Selected Providers ({selectedProviders.length})</h3>
                <div className={styles.selectedList}>
                  {selectedProviders.map((provider) => (
                    <div key={provider.id} className={styles.selectedProvider}>
                      <span className={styles.providerIcon}>
                        {getProviderIcon(provider.type)}
                      </span>
                      <div className={styles.providerInfo}>
                        <div className={styles.providerName}>{provider.name}</div>
                        <div className={styles.providerAddress}>{provider.address}</div>
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleProviderSelect(provider)}
                        aria-label="Remove provider"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Provider Results */}
            <div className={styles.providerResults}>
              <h3>Available Providers</h3>
              <div className={styles.providerGrid}>
                {filteredProviders.map((provider) => {
                  const isSelected = selectedProviders.find(p => p.id === provider.id);
                  return (
                    <Card
                      key={provider.id}
                      className={`${styles.providerCard} ${isSelected ? styles.selected : ''}`}
                      clickable
                      onClick={() => handleProviderSelect(provider)}
                    >
                      <div className={styles.providerHeader}>
                        <span className={styles.providerIcon}>
                          {getProviderIcon(provider.type)}
                        </span>
                        <div className={styles.providerMeta}>
                          <h4 className={styles.providerName}>{provider.name}</h4>
                          <p className={styles.providerType}>{provider.type}</p>
                        </div>
                        {isSelected && (
                          <div className={styles.selectedIndicator}>✓</div>
                        )}
                      </div>
                      
                      <div className={styles.providerDetails}>
                        <p className={styles.providerAddress}>{provider.address}</p>
                        <p className={styles.providerPhone}>{provider.phone}</p>
                        
                        {provider.specialties.length > 0 && (
                          <div className={styles.specialties}>
                            {provider.specialties.map((specialty, index) => (
                              <span key={index} className={styles.specialty}>
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {provider.doctors.length > 0 && (
                          <div className={styles.doctors}>
                            <strong>Doctors:</strong>
                            <ul>
                              {provider.doctors.slice(0, 2).map((doctor, index) => (
                                <li key={index}>{doctor}</li>
                              ))}
                              {provider.doctors.length > 2 && (
                                <li>+{provider.doctors.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Request Details */}
        {currentStep === 2 && (
          <div className={styles.requestDetails}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className={styles.detailsCard}>
                <h3>Request Details</h3>
                
                <div className={styles.formSection}>
                  <Input
                    label="Request Title"
                    placeholder="e.g., Complete Medical Records for Insurance"
                    {...register('requestTitle')}
                    error={errors.requestTitle?.message}
                    required
                  />
                </div>

                <div className={styles.formSection}>
                  <h4>Date Range (Optional)</h4>
                  <p className={styles.sectionDescription}>
                    Specify a date range if you only need records from a certain period
                  </p>
                  <div className={styles.dateRange}>
                    <Input
                      label="Start Date"
                      type="date"
                      {...register('dateRange.startDate')}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      {...register('dateRange.endDate')}
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Specific Record Types (Optional)</h4>
                  <p className={styles.sectionDescription}>
                    Select specific types of records you need, or leave blank for all records
                  </p>
                  <div className={styles.recordTypes}>
                    {recordTypes.map((type, index) => (
                      <label key={index} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          value={type}
                          {...register('specificRecords')}
                          className={styles.checkbox}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.textareaLabel}>
                    <span>Special Instructions (Optional)</span>
                    <textarea
                      {...register('specialInstructions')}
                      placeholder="Any specific instructions or additional information for the healthcare providers..."
                      className={styles.textarea}
                      rows={4}
                    />
                  </label>
                  {errors.specialInstructions && (
                    <span className={styles.error}>{errors.specialInstructions.message}</span>
                  )}
                </div>
              </Card>
            </form>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className={styles.reviewSubmit}>
            <Card className={styles.reviewCard}>
              <h3>Review Your Request</h3>
              
              <div className={styles.reviewSection}>
                <h4>Request Title</h4>
                <p>{watch('requestTitle') || 'Complete Medical Records Request'}</p>
              </div>

              <div className={styles.reviewSection}>
                <h4>Selected Providers ({selectedProviders.length})</h4>
                <div className={styles.providersList}>
                  {selectedProviders.map((provider) => (
                    <div key={provider.id} className={styles.reviewProvider}>
                      <span className={styles.providerIcon}>
                        {getProviderIcon(provider.type)}
                      </span>
                      <div>
                        <div className={styles.providerName}>{provider.name}</div>
                        <div className={styles.providerContact}>{provider.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(watch('dateRange.startDate') || watch('dateRange.endDate')) && (
                <div className={styles.reviewSection}>
                  <h4>Date Range</h4>
                  <p>
                    {watch('dateRange.startDate') && 
                      new Date(watch('dateRange.startDate')).toLocaleDateString()
                    }
                    {watch('dateRange.startDate') && watch('dateRange.endDate') && ' - '}
                    {watch('dateRange.endDate') && 
                      new Date(watch('dateRange.endDate')).toLocaleDateString()
                    }
                  </p>
                </div>
              )}

              {watch('specificRecords')?.length > 0 && (
                <div className={styles.reviewSection}>
                  <h4>Record Types</h4>
                  <ul>
                    {watch('specificRecords').map((record, index) => (
                      <li key={index}>{record}</li>
                    ))}
                  </ul>
                </div>
              )}

              {watch('specialInstructions') && (
                <div className={styles.reviewSection}>
                  <h4>Special Instructions</h4>
                  <p>{watch('specialInstructions')}</p>
                </div>
              )}
            </Card>

            <Card className={styles.estimateCard}>
              <h3>Estimated Timeline</h3>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>📨</span>
                  <div>
                    <div className={styles.timelineTitle}>Request Sent</div>
                    <div className={styles.timelineDesc}>Immediately after submission</div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>📋</span>
                  <div>
                    <div className={styles.timelineTitle}>Provider Processing</div>
                    <div className={styles.timelineDesc}>5-10 business days</div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>📄</span>
                  <div>
                    <div className={styles.timelineTitle}>Records Available</div>
                    <div className={styles.timelineDesc}>15-30 business days</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        {currentStep > 1 && (
          <Button
            variant="secondary"
            onClick={handlePreviousStep}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        
        <div className={styles.navSpacer} />
        
        {currentStep < 3 ? (
          <Button
            variant="primary"
            onClick={handleNextStep}
            disabled={isLoading}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
          >
            Submit Request
          </Button>
        )}
      </div>

      {/* Custom Provider Modal */}
      <Modal
        isOpen={isCustomProviderOpen}
        onClose={() => setIsCustomProviderOpen(false)}
        title="Add Custom Provider"
        size="medium"
      >
        <div className={styles.customProviderForm}>
          <Input
            label="Provider Name"
            value={customProvider.name}
            onChange={(e) => setCustomProvider({...customProvider, name: e.target.value})}
            required
          />
          <Input
            label="Phone Number"
            value={customProvider.phone}
            onChange={(e) => setCustomProvider({...customProvider, phone: e.target.value})}
          />
          <Input
            label="Fax Number"
            value={customProvider.fax}
            onChange={(e) => setCustomProvider({...customProvider, fax: e.target.value})}
          />
          <Input
            label="Email Address"
            type="email"
            value={customProvider.email}
            onChange={(e) => setCustomProvider({...customProvider, email: e.target.value})}
          />
          <Input
            label="Address"
            value={customProvider.address}
            onChange={(e) => setCustomProvider({...customProvider, address: e.target.value})}
          />
          <Input
            label="Contact Person"
            value={customProvider.contact}
            onChange={(e) => setCustomProvider({...customProvider, contact: e.target.value})}
          />
          
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setIsCustomProviderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCustomProviderAdd}
              disabled={!customProvider.name.trim()}
            >
              Add Provider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewRequestPage;