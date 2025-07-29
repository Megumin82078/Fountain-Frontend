import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import Input from '../../components/shared/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import styles from './SearchResultsPage.module.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock search data - same as GlobalSearch component
  const mockData = {
    documents: [
      { id: 1, type: 'document', title: 'Annual Physical Exam', category: 'Exam Report', provider: 'Dr. Sarah Johnson', date: '2024-01-15' },
      { id: 2, type: 'document', title: 'Blood Test Results', category: 'Lab Results', provider: 'City Lab', date: '2024-01-10' },
      { id: 3, type: 'document', title: 'X-Ray - Chest', category: 'Imaging', provider: 'Memorial Hospital', date: '2024-01-05' },
      { id: 4, type: 'document', title: 'Prescription History', category: 'Medication', provider: 'Dr. Michael Chen', date: '2023-12-20' },
      { id: 5, type: 'document', title: 'MRI Brain Scan', category: 'Imaging', provider: 'Memorial Hospital', date: '2023-11-15' },
      { id: 6, type: 'document', title: 'Colonoscopy Report', category: 'Procedure', provider: 'Dr. Lisa Wong', date: '2023-10-22' }
    ],
    conditions: [
      { id: 1, type: 'condition', name: 'Hypertension', icd10: 'I10', status: 'Active', provider: 'Dr. Sarah Johnson' },
      { id: 2, type: 'condition', name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', status: 'Active', provider: 'Dr. Michael Chen' },
      { id: 3, type: 'condition', name: 'Seasonal Allergies', icd10: 'J30.1', status: 'Active', provider: 'Dr. Emily Rodriguez' },
      { id: 4, type: 'condition', name: 'Gastroesophageal Reflux Disease', icd10: 'K21.9', status: 'Active', provider: 'Dr. Lisa Wong' }
    ],
    medications: [
      { id: 1, type: 'medication', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', provider: 'Dr. Sarah Johnson' },
      { id: 2, type: 'medication', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', provider: 'Dr. Michael Chen' },
      { id: 3, type: 'medication', name: 'Loratadine', dosage: '10mg', frequency: 'As needed', provider: 'Dr. Emily Rodriguez' },
      { id: 4, type: 'medication', name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', provider: 'Dr. Lisa Wong' }
    ],
    providers: [
      { id: 1, type: 'provider', name: 'Dr. Sarah Johnson', specialty: 'Family Medicine', phone: '(555) 123-4567' },
      { id: 2, type: 'provider', name: 'Dr. Michael Chen', specialty: 'Endocrinology', phone: '(555) 234-5678' },
      { id: 3, type: 'provider', name: 'Dr. Emily Rodriguez', specialty: 'Allergy & Immunology', phone: '(555) 345-6789' },
      { id: 4, type: 'provider', name: 'City Lab', specialty: 'Laboratory Services', phone: '(555) 456-7890' }
    ]
  };

  // Combine all searchable data
  const allData = [
    ...mockData.documents,
    ...mockData.conditions,
    ...mockData.medications,
    ...mockData.providers
  ];

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const filtered = allData.filter(item => {
      const searchableText = [
        item.title || item.name,
        item.category,
        item.provider,
        item.icd10,
        item.dosage,
        item.specialty
      ].join(' ').toLowerCase();

      return searchableText.includes(query.toLowerCase());
    });

    // Apply filter
    const finalResults = filter === 'all' 
      ? filtered 
      : filtered.filter(item => item.type === filter);

    setResults(finalResults);
    setIsSearching(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    performSearch(searchTerm);
  };

  const handleResultClick = (result) => {
    switch (result.type) {
      case 'document':
        navigate('/records');
        break;
      case 'condition':
      case 'medication':
        navigate('/profile/health');
        break;
      case 'provider':
        navigate('/requests/new');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'document': return '📄';
      case 'condition': return '🏥';
      case 'medication': return '💊';
      case 'provider': return '👨‍⚕️';
      default: return '📋';
    }
  };

  const getResultDescription = (result) => {
    switch (result.type) {
      case 'document':
        return `${result.category} • ${result.provider}`;
      case 'condition':
        return `${result.icd10} • ${result.provider}`;
      case 'medication':
        return `${result.dosage} ${result.frequency} • ${result.provider}`;
      case 'provider':
        return `${result.specialty} • ${result.phone}`;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filters = [
    { id: 'all', label: 'All Results', count: results.length },
    { id: 'document', label: 'Documents', count: results.filter(r => r.type === 'document').length },
    { id: 'condition', label: 'Conditions', count: results.filter(r => r.type === 'condition').length },
    { id: 'medication', label: 'Medications', count: results.filter(r => r.type === 'medication').length },
    { id: 'provider', label: 'Providers', count: results.filter(r => r.type === 'provider').length }
  ];

  return (
    <div className={styles.searchResults}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Search Results</h1>
          <p className={styles.subtitle}>
            {searchTerm ? `Results for "${searchTerm}"` : 'Search your health records'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>

      {/* Search Bar */}
      <Card className={styles.searchCard}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search health records, conditions, medications..."
            className={styles.searchInput}
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? '🔍' : 'Search'}
          </Button>
        </form>
      </Card>

      {/* Filters */}
      {searchTerm && (
        <Card className={styles.filtersCard}>
          <div className={styles.filterTabs}>
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                className={`${styles.filterTab} ${filter === filterOption.id ? styles.active : ''}`}
                onClick={() => handleFilterChange(filterOption.id)}
              >
                {filterOption.label}
                <span className={styles.count}>({filterOption.count})</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      <div className={styles.resultsSection}>
        {isSearching ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingIcon}>🔍</div>
            <p>Searching your health records...</p>
          </div>
        ) : results.length > 0 ? (
          <div className={styles.resultsList}>
            {results.map((result) => (
              <Card
                key={`${result.type}-${result.id}`}
                className={styles.resultCard}
                onClick={() => handleResultClick(result)}
              >
                <div className={styles.resultIcon}>
                  {getResultIcon(result.type)}
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultTitle}>
                    {result.title || result.name}
                  </div>
                  <div className={styles.resultDescription}>
                    {getResultDescription(result)}
                    {result.date && (
                      <span className={styles.resultDate}>
                        • {formatDate(result.date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.resultType}>
                  {result.type}
                </div>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No results found</h3>
            <p>
              No matches for "<strong>{searchTerm}</strong>". 
              Try searching for conditions, medications, or document types.
            </p>
            <div className={styles.suggestions}>
              <h4>Try searching for:</h4>
              <div className={styles.suggestionButtons}>
                <button onClick={() => setSearchTerm('blood test')}>
                  Blood Test
                </button>
                <button onClick={() => setSearchTerm('hypertension')}>
                  Hypertension
                </button>
                <button onClick={() => setSearchTerm('prescription')}>
                  Prescription
                </button>
                <button onClick={() => setSearchTerm('imaging')}>
                  Imaging
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👋</div>
            <h3>Search your health records</h3>
            <p>Find documents, conditions, medications, and providers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;