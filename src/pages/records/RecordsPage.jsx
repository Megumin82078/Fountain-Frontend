import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import Input from '../../components/shared/Input/Input';
import Modal from '../../components/shared/Modal/Modal';
import DocumentViewer from '../../components/shared/DocumentViewer/DocumentViewer';
import ShareModal from '../../components/shared/ShareModal/ShareModal';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthNotifications } from '../../components/shared/NotificationSystem/NotificationSystem';
import styles from './RecordsPage.module.css';

const RecordsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notifications = useHealthNotifications();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  // Mock data - will be replaced with real API data
  const mockDocuments = [
    {
      id: 1,
      title: 'Annual Physical Exam',
      category: 'Exam Report',
      provider: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      size: '2.4 MB',
      type: 'PDF',
      thumbnail: '📋',
      tags: ['Physical', 'Annual', 'Complete'],
      description: 'Comprehensive annual physical examination report including vital signs, lab results, and recommendations.',
      isNew: true
    },
    {
      id: 2,
      title: 'Blood Test Results',
      category: 'Lab Results',
      provider: 'City Lab',
      date: '2024-01-10',
      size: '1.2 MB',
      type: 'PDF',
      thumbnail: '🧪',
      tags: ['Blood Work', 'CBC', 'Lipid Panel'],
      description: 'Complete blood count and comprehensive metabolic panel results.',
      isNew: false
    },
    {
      id: 3,
      title: 'X-Ray - Chest',
      category: 'Imaging',
      provider: 'Memorial Hospital',
      date: '2024-01-05',
      size: '5.8 MB',
      type: 'DICOM',
      thumbnail: '🫁',
      tags: ['X-Ray', 'Chest', 'Routine'],
      description: 'Routine chest X-ray examination showing normal lung fields.',
      isNew: false
    },
    {
      id: 4,
      title: 'Prescription History',
      category: 'Medication',
      provider: 'Dr. Michael Chen',
      date: '2023-12-20',
      size: '850 KB',
      type: 'PDF',
      thumbnail: '💊',
      tags: ['Prescriptions', 'Medication', 'History'],
      description: 'Complete prescription history and current medication list.',
      isNew: false
    },
    {
      id: 5,
      title: 'Cardiology Consultation',
      category: 'Specialist Report',
      provider: 'Dr. Emily Rodriguez',
      date: '2023-12-15',
      size: '1.8 MB',
      type: 'PDF',
      thumbnail: '❤️',
      tags: ['Cardiology', 'Consultation', 'Heart'],
      description: 'Cardiology consultation report with ECG results and treatment recommendations.',
      isNew: false
    },
    {
      id: 6,
      title: 'Vaccination Record',
      category: 'Immunization',
      provider: 'Health Clinic',
      date: '2023-11-30',
      size: '450 KB',
      type: 'PDF',
      thumbnail: '💉',
      tags: ['Vaccination', 'Immunization', 'COVID-19'],
      description: 'Updated vaccination record including COVID-19 boosters.',
      isNew: false
    }
  ];

  const categories = [
    'All Documents',
    'Lab Results',
    'Exam Report',
    'Imaging',
    'Medication',
    'Specialist Report',
    'Immunization'
  ];

  const providers = [
    'All Providers',
    'Dr. Sarah Johnson',
    'Dr. Michael Chen',
    'Dr. Emily Rodriguez',
    'City Lab',
    'Memorial Hospital',
    'Health Clinic'
  ];

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesProvider = selectedProvider === 'all' || doc.provider === selectedProvider;
    
    return matchesSearch && matchesCategory && matchesProvider;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'name':
        return a.title.localeCompare(b.title);
      case 'provider':
        return a.provider.localeCompare(b.provider);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const handleDocumentClick = (document) => {
    if (selectionMode) {
      toggleRecordSelection(document.id);
    } else {
      setSelectedDocument(document);
      setIsPreviewOpen(true);
    }
  };

  const toggleRecordSelection = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredDocuments.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleDownload = (document) => {
    // Simulate download
    console.log('Downloading:', document.title);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'DICOM': return '🏥';
      case 'JPG':
      case 'PNG': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <div className={styles.recordsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Health Records</h1>
          <p className={styles.subtitle}>
            All your medical documents organized in one place
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="secondary" 
            onClick={() => setSelectionMode(!selectionMode)}
          >
            {selectionMode ? 'Cancel Selection' : 'Select Records'}
          </Button>
          {selectionMode && selectedRecords.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setIsShareModalOpen(true)}
            >
              🔗 Share ({selectedRecords.length})
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => navigate('/requests/new')}
          >
            Request Records
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className={styles.filtersCard}>
        <div className={styles.searchSection}>
          <div className={styles.searchInput}>
            <Input
              placeholder="Search documents, categories, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              {categories.map((category, index) => (
                <option key={index} value={index === 0 ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className={styles.filterSelect}
            >
              {providers.map((provider, index) => (
                <option key={index} value={index === 0 ? 'all' : provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="date">Date (Newest)</option>
              <option value="name">Name (A-Z)</option>
              <option value="provider">Provider</option>
              <option value="size">File Size</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} found
        </span>
        {searchTerm && (
          <span className={styles.searchInfo}>
            for "{searchTerm}"
          </span>
        )}
      </div>

      {/* Documents Grid/List */}
      {sortedDocuments.length > 0 ? (
        <div className={`${styles.documentsContainer} ${styles[viewMode]}`}>
          {sortedDocuments.map((document) => (
            <Card
              key={document.id}
              className={styles.documentCard}
              hoverable
              clickable
              onClick={() => handleDocumentClick(document)}
            >
              {document.isNew && <div className={styles.newBadge}>New</div>}
              
              <div className={styles.documentThumbnail}>
                <span className={styles.thumbnailIcon}>{document.thumbnail}</span>
                <span className={styles.fileType}>{getFileIcon(document.type)}</span>
              </div>

              <div className={styles.documentInfo}>
                <h3 className={styles.documentTitle}>{document.title}</h3>
                <p className={styles.documentDescription}>{document.description}</p>
                
                <div className={styles.documentMeta}>
                  <span className={styles.provider}>{document.provider}</span>
                  <span className={styles.date}>{formatDate(document.date)}</span>
                  <span className={styles.size}>{document.size}</span>
                </div>

                <div className={styles.documentTags}>
                  {document.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.documentActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(document);
                  }}
                  aria-label="Download document"
                >
                  ⬇️
                </button>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.share?.({
                      title: document.title,
                      text: document.description
                    });
                  }}
                  aria-label="Share document"
                >
                  📤
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <h3 className={styles.emptyTitle}>No documents found</h3>
          <p className={styles.emptyDescription}>
            {searchTerm
              ? `No documents match your search for "${searchTerm}"`
              : 'You don\'t have any medical records yet. Start by requesting records from your healthcare providers.'
            }
          </p>
          <Button onClick={() => navigate('/requests/new')}>
            Request Your First Records
          </Button>
        </div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        onShare={(doc) => {
          navigator.share?.({
            title: doc.title,
            text: doc.description
          });
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        records={selectedRecords.map(id => filteredDocuments.find(doc => doc.id === id))}
        title="Share Health Records"
      />
    </div>
  );
};

export default RecordsPage;