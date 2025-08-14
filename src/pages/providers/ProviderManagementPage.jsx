import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import providerService, { 
  PROVIDER_TYPES, 
  SPECIALTIES, 
  LANGUAGES
} from '../../services/providerService';
import toast from '../../utils/toast';

import { 
  Button, 
  Card, 
  HealthCard,
  Input,
  Select,
  Badge, 
  Alert,
  Modal,
  ConfirmModal,
  Tabs,
  LoadingSpinner,
  EmptyState
} from '../../components/common';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  StarIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  LanguageIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProviderManagementPage = () => {
  const { user } = useApp();
  const userId = user?.id;
  
  // State management
  const [myProviders, setMyProviders] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProviderId, setDeletingProviderId] = useState(null);
  
  // Forms
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: PROVIDER_TYPES.INDIVIDUAL,
    specialty: '',
    organizationName: '',
    licenseNumber: '',
    phone: '',
    fax: '',
    email: '',
    address: {
      street: '',
      suite: '',
      city: '',
      province: '',
      postalCode: '',
      country: ''
    },
    languages: ['English'],
    notes: '',
    website: '',
    acceptsNewPatients: true,
    virtualCareAvailable: false,
    hours: {},
    services: []
  });

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providers = await providerService.getProviders();
      setMyProviders(providers);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load providers. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await providerService.searchProviders({ query: searchQuery });
      setSearchResults(response.providers);
      setActiveTab(1); // Switch to search results tab
    } catch (error) {
      console.error('Error searching providers:', error);
      toast.error('Failed to search providers. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.address.street || !newProvider.address.city) {
      toast.error('Please fill in required fields: Name, Street Address, and City');
      return;
    }

    try {
      setLoading(true);
      const provider = await providerService.createProvider(newProvider);
      setMyProviders([...myProviders, provider]);
      setShowAddModal(false);
      resetNewProviderForm();
      setActiveTab(0); // Switch to My Providers tab
      toast.success('Provider added successfully');
    } catch (error) {
      console.error('Error adding provider:', error);
      toast.error(error.message || 'Failed to add provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = (providerId) => {
    setDeletingProviderId(providerId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProvider = async () => {
    if (!deletingProviderId) return;
    
    try {
      await providerService.deleteProvider(deletingProviderId);
      setMyProviders(myProviders.filter(p => p.id !== deletingProviderId));
      setShowDetailsModal(false);
      setShowDeleteConfirm(false);
      toast.success('Provider deleted successfully');
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider. Please try again.');
    } finally {
      setDeletingProviderId(null);
    }
  };

  const resetNewProviderForm = () => {
    setNewProvider({
      name: '',
      type: PROVIDER_TYPES.INDIVIDUAL,
      specialty: '',
      organizationName: '',
      licenseNumber: '',
      phone: '',
      fax: '',
      email: '',
      address: {
        street: '',
        suite: '',
        city: '',
        province: '',
        postalCode: '',
        country: ''
      },
      languages: ['English'],
      notes: '',
      website: '',
      acceptsNewPatients: true,
      virtualCareAvailable: false,
      hours: {},
      services: []
    });
  };

  const getProviderIcon = (type) => {
    switch (type) {
      case PROVIDER_TYPES.HOSPITAL:
        return <BuildingOffice2Icon className="w-5 h-5" />;
      case PROVIDER_TYPES.LABORATORY:
        return <BeakerIcon className="w-5 h-5" />;
      case PROVIDER_TYPES.CLINIC:
      case PROVIDER_TYPES.WALK_IN_CLINIC:
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case PROVIDER_TYPES.PHARMACY:
        return <HeartIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const formatProviderType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
    setShowDetailsModal(true);
  };

  const ProviderCard = ({ provider, onViewDetails, showDelete = false }) => (
    <HealthCard
      title={provider.name}
      subtitle={`${provider.specialty || formatProviderType(provider.type)}${provider.organizationName ? ` • ${provider.organizationName}` : ''}`}
      status="active"
      variant="default"
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetails(provider)}
      actions={showDelete ? [
        {
          label: 'Delete',
          variant: 'danger',
          onClick: (e) => {
            e.stopPropagation();
            handleDeleteProvider(provider.id);
          }
        }
      ] : []}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Type:</span>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            {getProviderIcon(provider.type)}
            <span className="text-sm font-medium">{formatProviderType(provider.type)}</span>
          </div>
        </div>
        
        {provider.address && (
          <div className="flex items-start justify-between text-sm">
            <MapPinIcon className="w-4 h-4 text-neutral-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-neutral-700">
              {provider.address.city}{provider.address.province ? `, ${provider.address.province}` : ''}{provider.address.country ? `, ${provider.address.country}` : ''}
            </span>
          </div>
        )}
        
        {provider.phone && (
          <div className="flex items-center justify-between text-sm">
            <PhoneIcon className="w-4 h-4 text-neutral-500 mr-2" />
            <span className="text-neutral-700">{provider.phone}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 pt-2">
          {provider.acceptsNewPatients && (
            <Badge variant="success" size="sm">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Accepting Patients
            </Badge>
          )}
          {provider.virtualCareAvailable && (
            <Badge variant="info" size="sm">
              Virtual Care
            </Badge>
          )}
          {provider.languages && provider.languages.length > 0 && (
            <Badge variant="default" size="sm">
              {provider.languages.length} language{provider.languages.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
    </HealthCard>
  );

  const providerTabs = [
    {
      label: 'My Providers',
      badge: myProviders.length > 0 ? myProviders.length : null,
      content: (
        <div className="mt-6">
          {loading ? (
            <LoadingSpinner />
          ) : myProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProviders.map((provider) => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider} 
                  onViewDetails={handleViewDetails}
                  showDelete={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BuildingOfficeIcon}
              title="No providers added yet"
              description="Add your healthcare providers to easily manage and access their information."
              actionLabel="Add Provider"
              onAction={() => setShowAddModal(true)}
              variant="default"
            />
          )}
        </div>
      )
    },
    {
      label: 'Search Results',
      badge: searchResults.length > 0 ? searchResults.length : null,
      content: (
        <div className="mt-6">
          {searchResults.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-neutral-600">
                  Found {searchResults.length} provider{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  Clear Results
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((provider) => (
                  <ProviderCard 
                    key={provider.id} 
                    provider={provider} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </>
          ) : (
            <Alert 
              variant="warning" 
              message="No search results. Use the search bar above to find providers."
            />
          )}
        </div>
      )
    }
  ];

  return (
    <AppLayout>
      <div className="content-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Healthcare Providers
              </h1>
              <p className="text-neutral-600">
                Manage your healthcare providers
              </p>
            </div>
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Provider</span>
            </Button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <Card className="mb-6">
          <div className="flex gap-3">
            <Input
              placeholder="Search providers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="primary" onClick={handleSearch} disabled={searchLoading}>
              Search
            </Button>
          </div>
        </Card>

        {/* Provider Tabs */}
        <Tabs 
          tabs={providerTabs} 
          activeTab={activeTab}
          onChange={(index) => setActiveTab(index)}
          variant="pills" 
        />

        {/* Add Provider Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Healthcare Provider"
          size="lg"
        >
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newProvider.name ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  1
                </div>
                <span className={`text-sm font-medium ${newProvider.name ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Basic Info
                </span>
              </div>
              <div className="h-px bg-neutral-200 flex-1 mx-4" />
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newProvider.address.street && newProvider.address.city ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  2
                </div>
                <span className={`text-sm font-medium ${newProvider.address.street && newProvider.address.city ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Location
                </span>
              </div>
              <div className="h-px bg-neutral-200 flex-1 mx-4" />
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${newProvider.phone || newProvider.email ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  3
                </div>
                <span className={`text-sm font-medium ${newProvider.phone || newProvider.email ? 'text-primary-600' : 'text-neutral-500'}`}>
                  Contact
                </span>
              </div>
            </div>


            {/* Step 1: Basic Information */}
            <div className="bg-neutral-50 p-3 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Provider Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Provider Name *
                  </label>
                  <Input
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                    placeholder="e.g., Dr. John Smith or City Medical Clinic"
                    className="w-full"
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Provider Type *
                </label>
                <Select
                  value={{ value: newProvider.type, label: formatProviderType(newProvider.type) }}
                  onChange={(option) => setNewProvider({...newProvider, type: option.value})}
                  options={Object.values(PROVIDER_TYPES).map(type => ({
                    value: type,
                    label: formatProviderType(type)
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Specialty
                </label>
                <Select
                  value={newProvider.specialty ? { value: newProvider.specialty, label: newProvider.specialty } : null}
                  onChange={(option) => setNewProvider({...newProvider, specialty: option?.value || ''})}
                  options={SPECIALTIES.map(s => ({ value: s, label: s }))}
                  placeholder="Select specialty"
                  isSearchable
                  isClearable
                />
              </div>

              {newProvider.type === PROVIDER_TYPES.INDIVIDUAL && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Organization/Clinic
                    </label>
                    <Input
                      value={newProvider.organizationName}
                      onChange={(e) => setNewProvider({...newProvider, organizationName: e.target.value})}
                      placeholder="e.g., Toronto General Hospital"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      License Number (Optional)
                    </label>
                    <Input
                      value={newProvider.licenseNumber}
                      onChange={(e) => setNewProvider({...newProvider, licenseNumber: e.target.value})}
                      placeholder="e.g., CPSO-12345"
                    />
                  </div>
                </>
              )}
              </div>
            </div>

            {/* Step 2: Location */}
            <div className="bg-neutral-50 p-3 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Location Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Street Address *
                  </label>
                  <Input
                    value={newProvider.address.street}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, street: e.target.value}
                    })}
                    placeholder="123 Main Street"
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.address.suite}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, suite: e.target.value}
                    })}
                    placeholder="Suite/Unit (Optional)"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.address.city}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, city: e.target.value}
                    })}
                    placeholder="City *"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.address.province}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, province: e.target.value}
                    })}
                    placeholder="Province/State"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.address.postalCode}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, postalCode: e.target.value}
                    })}
                    placeholder="Postal/ZIP Code"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.address.country}
                    onChange={(e) => setNewProvider({
                      ...newProvider, 
                      address: {...newProvider.address, country: e.target.value}
                    })}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact Information */}
            <div className="bg-neutral-50 p-3 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={newProvider.phone}
                    onChange={(e) => setNewProvider({...newProvider, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    leftIcon={<PhoneIcon className="w-4 h-4" />}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    value={newProvider.fax}
                    onChange={(e) => setNewProvider({...newProvider, fax: e.target.value})}
                    placeholder="Fax (Optional)"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="email"
                    value={newProvider.email}
                    onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                    placeholder="Email (Optional)"
                    leftIcon={<EnvelopeIcon className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Languages Spoken
              </label>
              <Select
                value={newProvider.languages.map(l => ({ value: l, label: l }))}
                onChange={(options) => setNewProvider({
                  ...newProvider, 
                  languages: options ? options.map(o => o.value) : []
                })}
                options={LANGUAGES.map(l => ({ value: l, label: l }))}
                isMulti
                isSearchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={newProvider.notes}
                onChange={(e) => setNewProvider({...newProvider, notes: e.target.value})}
                placeholder="Any additional notes about this provider..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowAddModal(false);
                resetNewProviderForm();
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddProvider}>
                Add Provider
              </Button>
            </div>
          </div>
        </Modal>

        {/* Provider Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={selectedProvider?.name || 'Provider Details'}
          size="lg"
        >
          {selectedProvider && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-lg bg-primary-100 text-primary-600`}>
                    {getProviderIcon(selectedProvider.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{selectedProvider.name}</h3>
                    <p className="text-neutral-600">{selectedProvider.specialty || formatProviderType(selectedProvider.type)}</p>
                    {selectedProvider.organizationName && (
                      <p className="text-sm text-neutral-500">{selectedProvider.organizationName}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedProvider.licenseNumber && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-sm text-neutral-600">License Number</p>
                  <p className="font-medium">{selectedProvider.licenseNumber}</p>
                </div>
              )}

              {selectedProvider.address && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Address
                  </h4>
                  <p className="text-neutral-700">
                    {selectedProvider.address.street}{selectedProvider.address.suite ? `, ${selectedProvider.address.suite}` : ''}<br />
                    {selectedProvider.address.city}{selectedProvider.address.province ? `, ${selectedProvider.address.province}` : ''} {selectedProvider.address.postalCode}<br />
                    {selectedProvider.address.country}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {selectedProvider.phone && (
                    <div className="flex items-center text-neutral-700">
                      <PhoneIcon className="w-4 h-4 mr-2 text-neutral-500" />
                      {selectedProvider.phone}
                    </div>
                  )}
                  {selectedProvider.fax && (
                    <div className="flex items-center text-neutral-700">
                      <DocumentTextIcon className="w-4 h-4 mr-2 text-neutral-500" />
                      Fax: {selectedProvider.fax}
                    </div>
                  )}
                  {selectedProvider.email && (
                    <div className="flex items-center text-neutral-700">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-neutral-500" />
                      {selectedProvider.email}
                    </div>
                  )}
                  {selectedProvider.website && (
                    <div className="flex items-center text-neutral-700">
                      <GlobeAltIcon className="w-4 h-4 mr-2 text-neutral-500" />
                      <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {selectedProvider.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {selectedProvider.languages && selectedProvider.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center">
                    <LanguageIcon className="w-4 h-4 mr-2" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.languages.map((lang) => (
                      <Badge key={lang} variant="default">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProvider.services && selectedProvider.services.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.services.map((service) => (
                      <Badge key={service} variant="info">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProvider.notes && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Notes</h4>
                  <p className="text-neutral-700 whitespace-pre-wrap">{selectedProvider.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletingProviderId(null);
          }}
          onConfirm={confirmDeleteProvider}
          title="Delete Provider"
          message="Are you sure you want to delete this provider? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </AppLayout>
  );
};

export default ProviderManagementPage;