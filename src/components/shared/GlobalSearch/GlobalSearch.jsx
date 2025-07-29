import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './GlobalSearch.module.css';

const GlobalSearch = ({ 
  isOpen, 
  onClose, 
  placeholder = "Search health records, conditions, medications..." 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Mock search data - in real app, this would come from API
  const mockData = {
    documents: [
      { id: 1, type: 'document', title: 'Annual Physical Exam', category: 'Exam Report', provider: 'Dr. Sarah Johnson', date: '2024-01-15' },
      { id: 2, type: 'document', title: 'Blood Test Results', category: 'Lab Results', provider: 'City Lab', date: '2024-01-10' },
      { id: 3, type: 'document', title: 'X-Ray - Chest', category: 'Imaging', provider: 'Memorial Hospital', date: '2024-01-05' },
      { id: 4, type: 'document', title: 'Prescription History', category: 'Medication', provider: 'Dr. Michael Chen', date: '2023-12-20' }
    ],
    conditions: [
      { id: 1, type: 'condition', name: 'Hypertension', icd10: 'I10', status: 'Active', provider: 'Dr. Sarah Johnson' },
      { id: 2, type: 'condition', name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', status: 'Active', provider: 'Dr. Michael Chen' },
      { id: 3, type: 'condition', name: 'Seasonal Allergies', icd10: 'J30.1', status: 'Active', provider: 'Dr. Emily Rodriguez' }
    ],
    medications: [
      { id: 1, type: 'medication', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', provider: 'Dr. Sarah Johnson' },
      { id: 2, type: 'medication', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', provider: 'Dr. Michael Chen' },
      { id: 3, type: 'medication', name: 'Loratadine', dosage: '10mg', frequency: 'As needed', provider: 'Dr. Emily Rodriguez' }
    ],
    providers: [
      { id: 1, type: 'provider', name: 'Dr. Sarah Johnson', specialty: 'Family Medicine', phone: '(555) 123-4567' },
      { id: 2, type: 'provider', name: 'Dr. Michael Chen', specialty: 'Endocrinology', phone: '(555) 234-5678' },
      { id: 3, type: 'provider', name: 'City Lab', specialty: 'Laboratory Services', phone: '(555) 345-6789' }
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
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (searchTerm.trim()) {
            handleViewAllResults();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, searchTerm]);

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

    // Limit results and group by type
    const groupedResults = {
      documents: filtered.filter(item => item.type === 'document').slice(0, 3),
      conditions: filtered.filter(item => item.type === 'condition').slice(0, 3),
      medications: filtered.filter(item => item.type === 'medication').slice(0, 3),
      providers: filtered.filter(item => item.type === 'provider').slice(0, 3)
    };

    const finalResults = [
      ...groupedResults.documents,
      ...groupedResults.conditions,
      ...groupedResults.medications,
      ...groupedResults.providers
    ].slice(0, 8); // Limit total results

    setResults(finalResults);
    setSelectedIndex(-1);
    setIsSearching(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedIndex(-1);
    onClose();
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
    handleClose();
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    handleClose();
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

  if (!isOpen) return null;

  return (
    <div className={styles.searchOverlay} onClick={handleClose}>
      <div className={styles.searchContainer} onClick={e => e.stopPropagation()}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={handleClose}
            className={styles.closeButton}
          >
            ESC
          </Button>
        </div>

        {/* Search Results */}
        <div className={styles.searchResults} ref={resultsRef}>
          {isSearching ? (
            <div className={styles.searchingState}>
              <div className={styles.searchingIcon}>🔍</div>
              <p>Searching your health records...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsCount}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleViewAllResults}
                    className={styles.viewAllButton}
                  >
                    View all results
                  </Button>
                )}
              </div>
              
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`${styles.resultItem} ${
                      index === selectedIndex ? styles.selected : ''
                    }`}
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
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h4>No results found</h4>
              <p>
                No matches for "<strong>{searchTerm}</strong>". 
                Try searching for conditions, medications, or document types.
              </p>
              <div className={styles.searchSuggestions}>
                <h5>Try searching for:</h5>
                <div className={styles.suggestions}>
                  <button onClick={() => {setSearchTerm('blood test'); performSearch('blood test');}}>
                    Blood Test
                  </button>
                  <button onClick={() => {setSearchTerm('hypertension'); performSearch('hypertension');}}>
                    Hypertension
                  </button>
                  <button onClick={() => {setSearchTerm('prescription'); performSearch('prescription');}}>
                    Prescription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.searchPrompt}>
              <div className={styles.promptIcon}>👋</div>
              <h4>Search your health records</h4>
              <p>Find documents, conditions, medications, and providers</p>
              
              <div className={styles.quickFilters}>
                <h5>Quick searches:</h5>
                <div className={styles.filterButtons}>
                  <button onClick={() => {setSearchTerm('lab results'); performSearch('lab results');}}>
                    📊 Lab Results
                  </button>
                  <button onClick={() => {setSearchTerm('prescriptions'); performSearch('prescriptions');}}>
                    💊 Prescriptions
                  </button>
                  <button onClick={() => {setSearchTerm('imaging'); performSearch('imaging');}}>
                    🏥 Imaging
                  </button>
                  <button onClick={() => {setSearchTerm('doctor'); performSearch('doctor');}}>
                    👨‍⚕️ Doctors
                  </button>
                </div>
              </div>

              <div className={styles.keyboardHints}>
                <div className={styles.hint}>
                  <kbd>↑</kbd><kbd>↓</kbd> Navigate
                </div>
                <div className={styles.hint}>
                  <kbd>Enter</kbd> Select
                </div>
                <div className={styles.hint}>
                  <kbd>Esc</kbd> Close
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;