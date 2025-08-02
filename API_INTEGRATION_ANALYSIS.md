# API Integration Analysis - Fountain Frontend

## Overview
This document analyzes the Fountain Frontend application and maps all API usage to the available backend endpoints from the OpenAPI specification. It identifies which APIs can be connected immediately and what additional APIs are needed.

## Available Backend APIs (from OpenAPI spec)

### 1. Authentication APIs
- `POST /auth/sign-up` - User registration
- `POST /auth/login` - User authentication (OAuth2 password flow)

### 2. Profile & Dashboard APIs
- `GET /profile/dashboard/me` - Get dashboard summary
- `GET /profile/dashboard/me/detail` - Get detailed dashboard info

### 3. Health Data APIs
- `GET /profile/me/health-data` - Get all health data categories
- `GET /profile/me/health-data/{category}` - Get specific category data
- `GET /profile/me/health-data/abnormal` - Get abnormal health data
- `GET /profile/me/health-data/abnormal/{category}` - Get abnormal data by category
- `GET /profile/me/health-advice` - Get health advice
- `GET /profile/me/health-advice/{category}` - Get advice by category

### 4. Individual Health Categories
- `GET /profile/me/labs` - Get lab results
- `GET /profile/me/medications` - Get medications
- `GET /profile/me/procedures` - Get procedures
- `GET /profile/me/vitals` - Get vital signs
- `GET /profile/me/conditions` - Get health conditions
- `GET /profile/me/diseases` - Get diseases
- `GET /profile/me/alerts` - Get user alerts

### 5. Request Batch APIs
- `POST /request-batches` - Create new request batch
- `GET /request-batches` - List request batches
- `GET /request-batches/{batch_id}` - Get specific batch

### 6. Provider APIs
- `GET /provider` - List providers (with optional name filter)
- `POST /provider` - Create provider
- `GET /provider/{provider_id}` - Get specific provider
- `PUT /provider/{provider_id}` - Update provider
- `DELETE /provider/{provider_id}` - Delete provider

### 7. Facility APIs
- `GET /facilities` - List facilities
- `POST /facilities` - Create facility
- `GET /facilities/{facility_id}` - Get specific facility
- `PUT /facilities/{facility_id}` - Update facility
- `DELETE /facilities/{facility_id}` - Delete facility
- `PUT /facilities/{facility_id}/providers/{provider_id}` - Attach provider to facility

### 8. File Upload APIs
- `GET /provider/upload-link/{provider_request_id}` - Get upload URL
- `POST /provider/upload/{token}` - Upload file

### 9. Alert APIs
- `GET /alerts` - List alerts
- `POST /alerts` - Create alert
- `GET /alerts/{alert_id}` - Get specific alert
- `PUT /alerts/{alert_id}` - Update alert
- `DELETE /alerts/{alert_id}` - Delete alert

### 10. Health Check
- `GET /healthz` - API health check

## Frontend API Usage Mapping

### ✅ APIs Ready for Connection

#### 1. Authentication (LoginPage.jsx, SignUpPage.jsx)
```javascript
// Frontend Mock Implementation
apiService.login(credentials) // Line 160-209 in api.js
apiService.signUp(userData)   // Line 117-158 in api.js

// Can connect to:
POST /auth/login
POST /auth/sign-up
```
**Status**: Ready to integrate. Remove mock implementation and use real endpoints.

#### 2. Dashboard Data (DashboardPage.jsx)
```javascript
// Frontend Mock Implementation
apiService.getDashboard()       // Line 241-251 in api.js
apiService.getDashboardDetail() // Line 253-264 in api.js

// Can connect to:
GET /profile/dashboard/me
GET /profile/dashboard/me/detail
```
**Status**: Ready to integrate. Backend provides the exact data structure needed.

#### 3. Health Data Categories
```javascript
// Frontend Mock Implementation
apiService.getLabs()        // Line 309-343 in api.js
apiService.getMedications() // Line 345-381 in api.js
apiService.getProcedures()  // Line 383-413 in api.js
apiService.getVitals()      // Line 415-449 in api.js
apiService.getConditions()  // Line 451-487 in api.js

// Can connect to:
GET /profile/me/labs
GET /profile/me/medications
GET /profile/me/procedures
GET /profile/me/vitals
GET /profile/me/conditions
```
**Status**: Ready to integrate. Direct 1:1 mapping available.

#### 4. Alerts/Reminders (ReminderPage.jsx)
```javascript
// Frontend Mock Implementation
apiService.getAlerts()              // Line 495-541 in api.js
apiService.updateAlert(id, data)    // Line 543-555 in api.js
apiService.deleteAlert(id)          // Line 576-586 in api.js

// Can connect to:
GET /alerts
PUT /alerts/{alert_id}
DELETE /alerts/{alert_id}
```
**Status**: Ready to integrate. Note: Frontend uses "reminders" terminology but backend uses "alerts".

#### 5. Providers (ProvidersPage.jsx)
```javascript
// Frontend Mock Implementation
apiService.getProviders(name)       // Line 589-642 in api.js
apiService.createProvider(data)     // Line 644-658 in api.js
apiService.updateProvider(id, data) // Line 659-663 in api.js
apiService.deleteProvider(id)       // Line 665-669 in api.js

// Can connect to:
GET /provider?name={name}
POST /provider
PUT /provider/{provider_id}
DELETE /provider/{provider_id}
```
**Status**: Ready to integrate. Full CRUD operations available.

#### 6. Abnormal Health Data
```javascript
// Frontend Mock Implementation
apiService.getAbnormalHealthData() // Line 290-296 in api.js

// Can connect to:
GET /profile/me/health-data/abnormal
```
**Status**: Ready to integrate.

## ✅ Request Tracking Integration

### Request Batch APIs (Already Available in Backend)
The backend provides comprehensive request batch APIs that can be connected to the frontend's request tracking functionality:

```javascript
// Frontend Implementation (RequestTrackingPage.jsx)
// Mock request tracking data (Lines 34-125)
const fetchRequestDetails = async () => {
  // Currently using mock data
  const mockRequest = {
    id: requestId,
    trackingNumber: `REQ-${requestId?.toUpperCase()}`,
    status: "in_progress",
    // ... other fields
  };
}

// Can connect to:
GET /request-batches/{batch_id}
```

**Available Request Batch Endpoints:**
1. `POST /request-batches` - Create new request batch
   - Request body includes: patient_id, facility_ids, date_range, record_types
2. `GET /request-batches` - List all request batches
   - Returns array of request batches with status
3. `GET /request-batches/{batch_id}` - Get specific batch details
   - Returns detailed batch information including provider requests

**Mapping to Frontend:**
- Frontend `RequestTrackingPage` can use `GET /request-batches/{batch_id}` to fetch real request details
- The tracking history, progress, and status updates can be derived from the batch response
- Document processing steps can map to individual provider requests within the batch

**Required Frontend Updates:**
1. Update `fetchRequestDetails` to call real API endpoint
2. Map backend response structure to frontend display format
3. Add real-time status polling or WebSocket connection for live updates

## ❌ Missing Backend APIs

### 1. AI Health Report & Recommendations
**Frontend Usage**: DashboardPage.jsx (Lines 30-83, 86-100)
```javascript
// Needed API
GET /profile/me/ai-report
POST /profile/me/ai-report/generate

// Expected Response Structure
{
  "summary": {
    "healthScore": 85,
    "trend": "improving",
    "keyInsights": ["..."]
  },
  "recommendations": [{
    "id": "rec-1",
    "priority": "high",
    "category": "medication",
    "title": "...",
    "description": "...",
    "impact": "..."
  }],
  "riskFactors": [{
    "factor": "Cardiovascular",
    "level": "moderate",
    "score": 35,
    "trend": "decreasing"
  }]
}
```

### 2. Health Data CRUD Operations
**Frontend Usage**: Various pages need to create/update/delete health records
```javascript
// Needed APIs for Conditions
POST /profile/me/conditions
PUT /profile/me/conditions/{condition_id}
DELETE /profile/me/conditions/{condition_id}

// Needed APIs for Medications
POST /profile/me/medications
PUT /profile/me/medications/{medication_id}
DELETE /profile/me/medications/{medication_id}

// Needed APIs for Lab Results
POST /profile/me/labs
PUT /profile/me/labs/{lab_id}
DELETE /profile/me/labs/{lab_id}

// Needed APIs for Vital Signs
POST /profile/me/vitals
PUT /profile/me/vitals/{vital_id}
DELETE /profile/me/vitals/{vital_id}

// Needed APIs for Procedures
POST /profile/me/procedures
PUT /profile/me/procedures/{procedure_id}
DELETE /profile/me/procedures/{procedure_id}
```

### 3. User Profile Management
**Frontend Usage**: ProfilePage.jsx, AppContext.jsx
```javascript
// Needed APIs
GET /profile/me
PUT /profile/me
POST /profile/me/change-password
POST /profile/me/upload-avatar
DELETE /profile/me/avatar
```

### 4. Health Summary Statistics
**Frontend Usage**: useHealthData.js hook
```javascript
// Needed API
GET /profile/me/health-summary

// Expected Response
{
  "totalRecords": 45,
  "activeConditions": 3,
  "currentMedications": 2,
  "recentLabs": 8,
  "abnormalResults": 2
}
```

### 5. Medical Report Generation
**Frontend Usage**: DashboardPage.jsx (Lines 109-163)
```javascript
// Needed API
GET /profile/me/medical-report
POST /profile/me/medical-report/generate

// Query Parameters
?format=pdf|txt|html
?dateFrom=2024-01-01
?dateTo=2024-12-31
?categories=conditions,medications,labs,vitals,procedures
```

### 6. Appointment Management
**Frontend Usage**: Referenced in dashboard but no dedicated page
```javascript
// Needed APIs
GET /profile/me/appointments
POST /profile/me/appointments
PUT /profile/me/appointments/{appointment_id}
DELETE /profile/me/appointments/{appointment_id}
```

### 7. Search & Filtering
**Frontend Usage**: Various pages use client-side filtering
```javascript
// Needed APIs with query parameters
GET /profile/me/health-data?search=term&dateFrom=date&dateTo=date&status=active
GET /profile/me/labs?abnormal=true&dateFrom=date
GET /profile/me/medications?status=active
```

### 8. Forgot Password Flow
**Frontend Usage**: LoginPage.jsx
```javascript
// Needed APIs
POST /auth/forgot-password
POST /auth/reset-password
```

### 9. Token Refresh
**Frontend Usage**: api.js interceptor expects token refresh
```javascript
// Needed API
POST /auth/refresh
```

### 10. Logout
**Frontend Usage**: api.js, AppHeader.jsx
```javascript
// Needed API
POST /auth/logout
```

### 11. Request Creation Page
**Frontend Usage**: Referenced in navigation but page not implemented
```javascript
// Needed APIs for creating new requests
GET /facilities/search?name=query  // Search facilities to request from
POST /request-batches/preview      // Preview what records would be requested
GET /profile/me/available-records  // Show what records user can request

// Expected request creation flow:
1. Select facilities/providers
2. Select date range
3. Select record types
4. Preview request
5. Submit request
```

### 12. Request Management
**Frontend Usage**: Request tracking page exists but needs full CRUD
```javascript
// Needed APIs
PUT /request-batches/{batch_id}/cancel    // Cancel pending request
POST /request-batches/{batch_id}/resend   // Resend failed requests
GET /request-batches/{batch_id}/download  // Download received records
```

## Implementation Priority

### Phase 1 - Core Functionality (Immediate)
1. Connect authentication APIs (login/signup)
2. Connect dashboard APIs
3. Connect health data read APIs (labs, medications, conditions, vitals, procedures)
4. Connect alerts APIs
5. Connect request batch APIs for tracking

### Phase 2 - Essential Features (1-2 weeks)
1. Implement health data CRUD APIs
2. Add user profile management APIs
3. Implement AI health report APIs
4. Add medical report generation

### Phase 3 - Enhanced Features (2-4 weeks)
1. Add appointment management
2. Implement advanced search/filtering
3. Add forgot password flow
4. Implement token refresh mechanism

## Notes for Backend Development

1. **Authentication**: Frontend expects Bearer token authentication. Ensure token includes user data or provide separate endpoint.

2. **Error Handling**: Frontend expects error responses in format:
   ```json
   {
     "error": "Error message",
     "detail": "Detailed error description"
   }
   ```

3. **Date Formats**: Frontend uses ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)

4. **Pagination**: Consider adding pagination to list endpoints as data grows

5. **Real-time Updates**: Consider WebSocket support for alerts/reminders

6. **File Uploads**: Frontend references file upload capability but no implementation exists

## Frontend Changes Needed

1. Update `API_BASE_URL` in `types/api.js` to point to actual backend
2. Remove mock implementations from `api.js`
3. Update error handling to match backend error format
4. Add proper loading states for API calls
5. Implement token storage and refresh logic
6. Add retry logic for failed requests