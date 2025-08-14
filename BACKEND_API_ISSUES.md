# Backend API Integration Issues Analysis

## Overview
After thorough analysis of the backend API schema and frontend implementation, I've identified several critical issues that prevent proper functionality. The main problems stem from missing endpoints, incorrect data schemas, and API design limitations.

## 1. Profile Update Issues

### Problem
- Profile updates are failing despite sending the correct schema (`email` and `profile_json`)
- The backend expects `ProfileUpdate` schema but may have validation issues

### Backend Schema
```json
"ProfileUpdate": {
  "properties": {
    "email": {
      "anyOf": [
        {"type": "string", "format": "email"},
        {"type": "null"}
      ]
    },
    "profile_json": {
      "anyOf": [
        {"additionalProperties": true, "type": "object"},
        {"type": "null"}
      ]
    }
  }
}
```

### Possible Issues
1. **CORS Configuration**: The backend might not be properly configured for CORS, blocking PUT requests
2. **Authentication**: Token might not be properly validated for profile updates
3. **Data Validation**: The backend might have stricter validation than documented

### Debug Steps
1. Check browser console for CORS errors
2. Verify the token is being sent in the Authorization header
3. Check backend logs for validation errors

## 2. Profile Picture Upload Issues

### Problem
- Avatar upload fails even with correct multipart/form-data format
- Endpoint: `POST /profile/me/upload-avatar`

### Backend Schema
```json
"Body_upload_avatar_profile_me_upload_avatar_post": {
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "title": "File"
    }
  },
  "required": ["file"]
}
```

### Possible Issues
1. **File Size Limits**: Backend might have undocumented file size restrictions
2. **File Type Validation**: Backend might only accept specific image formats
3. **Gravatar Integration**: The backend uses Gravatar, which might have its own limitations
4. **Multipart Parsing**: Backend might not properly parse multipart/form-data

## 3. Condition Creation Issues

### Problem
- No diseases showing in the dropdown because there's no GET endpoint for disease facts
- The `/profile/me/diseases` endpoint returns user's diseases, not available disease options

### Missing Endpoint
The backend lacks a crucial endpoint:
- `GET /health-data/disease-facts` - Does not exist
- Only `POST /health-data/disease-facts` exists (for creating new disease facts)

### Current Workaround
Frontend uses mock data for disease list, but this doesn't match backend's disease IDs

### Solution Needed
Backend needs to implement:
```
GET /health-data/disease-facts
Response: Array of available diseases with id, name, and code
```

## 4. Request Batch Creation

### Problem
- No endpoint to create new request batches
- Frontend can only view existing batches via `GET /request-batches/{batch_id}`

### Missing Endpoint
```
POST /request-batches
Body: {
  title: string,
  description: string,
  provider_id: string,
  request_type: string,
  priority: string,
  record_types: array,
  notes: string
}
```

### Impact
- Users cannot create new medical record requests
- Request tracking only works for pre-existing batches

## 5. Data Schema Mismatches

### Health Data Creation Issues

#### Medications
Backend expects `fact_id` but no endpoint provides available medication facts:
```json
{
  "fact_id": "uuid",  // Where to get valid fact_ids?
  "label": "string",
  "dose": "number",
  "unit": "string"
}
```

#### Lab Results & Vitals
Similar issue - require `fact_id` without a way to retrieve valid facts

## 6. Authentication & CORS Issues

### Symptoms
- 401 errors on some endpoints despite valid token
- CORS errors on PUT/POST requests

### Possible Causes
1. **Token Expiration**: Backend might have short token expiration
2. **CORS Headers**: Backend might not send proper CORS headers for all methods
3. **Preflight Requests**: OPTIONS requests might not be handled

## 7. Recommended Backend Fixes

### High Priority
1. **Implement GET endpoints for facts**:
   - `GET /health-data/disease-facts`
   - `GET /health-data/medication-facts`
   - `GET /health-data/lab-facts`
   - `GET /health-data/vital-facts`
   - `GET /health-data/procedure-facts`

2. **Add request batch creation**:
   - `POST /request-batches`

3. **Fix CORS configuration**:
   - Allow PUT, POST, DELETE methods
   - Handle preflight OPTIONS requests
   - Include all necessary headers

### Medium Priority
1. **Improve error messages**:
   - Return specific validation errors
   - Include field-level error details

2. **Document file upload constraints**:
   - Maximum file size
   - Accepted file types
   - Image dimension limits

3. **Add batch endpoints**:
   - `GET /request-batches` (list all user's batches)
   - `DELETE /request-batches/{batch_id}`

### Low Priority
1. **Add search/filter parameters**:
   - Disease search: `GET /health-data/disease-facts?search=diabetes`
   - Provider search improvements

2. **Implement data export endpoints**:
   - Export health records
   - Download request batch documents

## 8. Frontend Workarounds (Temporary)

1. **Mock Data**: Using hardcoded disease/medication lists
2. **Local Storage**: Storing requests locally when backend fails
3. **Fallback UI**: Showing appropriate messages when endpoints fail

## 9. Testing Recommendations

### API Testing
1. Use Postman/Insomnia to test each endpoint directly
2. Verify authentication headers are accepted
3. Test with various payload sizes and formats

### Integration Testing
1. Monitor network requests in browser DevTools
2. Check for CORS errors in console
3. Verify request/response payloads match schemas

## Conclusion

The main issues stem from:
1. Missing GET endpoints for reference data (diseases, medications, etc.)
2. No POST endpoint for creating request batches
3. Potential CORS and authentication configuration issues
4. Lack of proper error messages from the backend

Until these backend issues are resolved, the frontend will continue to experience failures in profile updates, condition creation, and request management functionality.