import apiService from './api';

// Provider service that matches backend API schema
class ProviderService {
  // Get all providers for the current user
  async getProviders() {
    try {
      const providers = await apiService.getProviders();
      // Return empty array if no providers, not mock data
      if (!providers || !Array.isArray(providers)) {
        return [];
      }
      return providers.map(p => this.transformBackendProvider(p));
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get provider by ID
  async getProvider(providerId) {
    try {
      const providers = await apiService.getProviders();
      const provider = providers.find(p => p.id === providerId);
      return provider ? this.transformBackendProvider(provider) : null;
    } catch (error) {
      console.error('Error fetching provider:', error);
      // Return null instead of mock data
      return null;
    }
  }

  // Create a new provider
  async createProvider(providerData) {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        name: providerData.name,
        phone: providerData.phone || null,
        fax: providerData.fax || null,
        email: providerData.email || null,
        contact_json: {
          // Store additional data in contact_json
          type: providerData.type,
          specialty: providerData.specialty,
          address: providerData.address,
          languages: providerData.languages,
          acceptsNewPatients: providerData.acceptsNewPatients,
          virtualCareAvailable: providerData.virtualCareAvailable,
          hours: providerData.hours,
          services: providerData.services,
          notes: providerData.notes,
          website: providerData.website,
          licenseNumber: providerData.licenseNumber,
          organizationName: providerData.organizationName
        },
        facility_ids: providerData.facility_ids || []
      };

      const provider = await apiService.createProvider(backendData);
      return this.transformBackendProvider(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      // Throw error instead of returning mock data
      throw new Error(error.message || 'Failed to create provider');
    }
  }

  // Update provider
  async updateProvider(providerId, updates) {
    try {
      const backendData = {
        name: updates.name,
        phone: updates.phone,
        fax: updates.fax,
        email: updates.email,
        contact_json: {
          type: updates.type,
          specialty: updates.specialty,
          address: updates.address,
          languages: updates.languages,
          acceptsNewPatients: updates.acceptsNewPatients,
          virtualCareAvailable: updates.virtualCareAvailable,
          hours: updates.hours,
          services: updates.services,
          notes: updates.notes,
          website: updates.website,
          licenseNumber: updates.licenseNumber,
          organizationName: updates.organizationName
        },
        facility_ids: updates.facility_ids
      };

      const provider = await apiService.updateProvider(providerId, backendData);
      return this.transformBackendProvider(provider);
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  // Delete provider
  async deleteProvider(providerId) {
    try {
      await apiService.deleteProvider(providerId);
      return true;
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  }

  // Search providers by name
  async searchProviders({ query }) {
    try {
      const providers = await apiService.getProviders(query);
      const transformedProviders = providers.map(p => this.transformBackendProvider(p));
      return {
        providers: transformedProviders,
        total: transformedProviders.length
      };
    } catch (error) {
      console.error('Error searching providers:', error);
      // Use mock search for development
      const mockProviders = this.getMockProviders();
      const filtered = mockProviders.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      return {
        providers: filtered,
        total: filtered.length
      };
    }
  }

  // Transform backend provider to frontend format
  transformBackendProvider(backendProvider) {
    const contact_json = backendProvider.contact_json || {};
    
    return {
      id: backendProvider.id,
      name: backendProvider.name,
      phone: backendProvider.phone,
      fax: backendProvider.fax,
      email: backendProvider.email,
      // Extract additional fields from contact_json
      type: contact_json.type || 'individual',
      specialty: contact_json.specialty,
      address: contact_json.address,
      languages: contact_json.languages || [],
      acceptsNewPatients: contact_json.acceptsNewPatients,
      virtualCareAvailable: contact_json.virtualCareAvailable,
      hours: contact_json.hours,
      services: contact_json.services || [],
      notes: contact_json.notes,
      website: contact_json.website,
      licenseNumber: contact_json.licenseNumber,
      organizationName: contact_json.organizationName,
      facilities: backendProvider.facilities || []
    };
  }

  // Get mock providers for development
  getMockProviders() {
    return [
      {
        id: 'prov-001',
        name: 'Dr. Sarah Chen',
        type: 'individual',
        specialty: 'Family Medicine',
        phone: '(416) 555-0123',
        fax: '(416) 555-0124',
        email: 'dr.chen@example.com',
        address: {
          street: '123 Health St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5V 3A8',
          country: 'Canada'
        },
        languages: ['English', 'Mandarin'],
        acceptsNewPatients: true,
        virtualCareAvailable: true,
        facilities: []
      },
      {
        id: 'prov-002',
        name: 'Oakville Medical Center',
        type: 'clinic',
        phone: '(905) 555-0200',
        fax: '(905) 555-0201',
        email: 'info@oakvillemedical.com',
        address: {
          street: '456 Medical Ave',
          city: 'Oakville',
          province: 'ON',
          postalCode: 'L6H 5R5',
          country: 'Canada'
        },
        services: ['Family Medicine', 'Walk-in Clinic', 'Pediatrics'],
        languages: ['English', 'French'],
        acceptsNewPatients: true,
        virtualCareAvailable: false,
        facilities: []
      },
      {
        id: 'prov-003',
        name: 'Dr. Michael Thompson',
        type: 'individual',
        specialty: 'Cardiology',
        phone: '(416) 555-0300',
        email: 'dr.thompson@heartcare.com',
        address: {
          street: '789 Cardiac Lane',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5G 2C4',
          country: 'Canada'
        },
        languages: ['English'],
        acceptsNewPatients: false,
        virtualCareAvailable: true,
        organizationName: 'Toronto Heart Institute',
        facilities: []
      }
    ];
  }
}

export default new ProviderService();

// Export types for UI components
export const PROVIDER_TYPES = {
  INDIVIDUAL: 'individual',
  HOSPITAL: 'hospital',
  CLINIC: 'clinic',
  LABORATORY: 'laboratory',
  IMAGING_CENTER: 'imaging_center',
  PHARMACY: 'pharmacy',
  WALK_IN_CLINIC: 'walk_in_clinic',
  SPECIALIST_OFFICE: 'specialist_office'
};

export const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'General Surgery',
  'Orthopedic Surgery',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Ophthalmology',
  'Otolaryngology (ENT)',
  'Urology',
  'Radiology',
  'Anesthesiology',
  'Emergency Medicine',
  'Pathology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Infectious Diseases',
  'Nephrology',
  'Oncology',
  'Respirology',
  'Rheumatology',
  'Sports Medicine'
];

export const LANGUAGES = [
  'English',
  'French',
  'Mandarin',
  'Cantonese',
  'Punjabi',
  'Spanish',
  'Tagalog',
  'Arabic',
  'Italian',
  'Portuguese',
  'Urdu',
  'German',
  'Vietnamese',
  'Russian',
  'Polish',
  'Korean',
  'Tamil',
  'Persian (Farsi)',
  'Hindi',
  'Gujarati'
];