import React, { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card } from '../../components/common';
import { API_BASE_URL } from '../../config/api';

const ApiTestPage = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { name: 'Health Check', url: '/healthz', method: 'GET' },
    { name: 'Profile', url: '/profile/me', method: 'GET' },
    { name: 'Conditions List', url: '/health-data/conditions', method: 'GET' },
    { name: 'Medications List', url: '/health-data/medications', method: 'GET' },
    { name: 'Vitals List', url: '/health-data/vitals', method: 'GET' },
    { name: 'Labs List', url: '/health-data/labs', method: 'GET' },
    { name: 'Procedures List', url: '/health-data/procedures', method: 'GET' },
    { name: 'Providers List', url: '/provider', method: 'GET' },
    { name: 'My Conditions', url: '/profile/me/conditions', method: 'GET' },
    { name: 'My Medications', url: '/profile/me/medications', method: 'GET' },
    { name: 'My Vitals', url: '/profile/me/vitals', method: 'GET' },
    { name: 'My Labs', url: '/profile/me/labs', method: 'GET' },
  ];

  const testEndpoints = async () => {
    setTesting(true);
    setResults([]);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found. Some endpoints will fail with 401.');
    }
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const newResults = [];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      let result = {
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        fullUrl: `${API_BASE_URL}${endpoint.url}`,
        status: 'testing',
        time: 0
      };
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          method: endpoint.method,
          headers
        });
        
        const endTime = Date.now();
        result.time = endTime - startTime;
        result.status = response.status;
        result.statusText = response.statusText;
        result.success = response.ok;
        
        if (response.ok) {
          try {
            result.data = await response.json();
          } catch (e) {
            result.data = 'Response is not JSON';
          }
        } else {
          try {
            result.error = await response.json();
          } catch (e) {
            result.error = await response.text();
          }
        }
      } catch (error) {
        const endTime = Date.now();
        result.time = endTime - startTime;
        result.status = 'error';
        result.error = error.message;
        result.success = false;
      }
      
      newResults.push(result);
      setResults([...newResults]);
    }
    
    setTesting(false);
  };

  const getStatusColor = (result) => {
    if (result.status === 'testing') return 'text-blue-600';
    if (result.status === 'error') return 'text-red-600';
    if (result.status >= 200 && result.status < 300) return 'text-green-600';
    if (result.status >= 400 && result.status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <AppLayout>
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">API Endpoint Tester</h1>
          <p className="text-neutral-600">Test all API endpoints to identify which ones are working</p>
          <p className="text-sm text-neutral-500 mt-2">
            Current API Base URL: <code className="bg-neutral-100 px-2 py-1 rounded">{API_BASE_URL}</code>
          </p>
        </div>

        <Card className="p-6 mb-6">
          <Button 
            onClick={testEndpoints} 
            disabled={testing}
            variant="primary"
          >
            {testing ? 'Testing...' : 'Test All Endpoints'}
          </Button>
        </Card>

        {results.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{result.name}</h3>
                      <p className="text-sm text-neutral-600">
                        {result.method} {result.url}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getStatusColor(result)}`}>
                        {result.status === 'testing' ? 'Testing...' : 
                         result.status === 'error' ? 'Error' : 
                         `${result.status} ${result.statusText || ''}`}
                      </span>
                      <p className="text-sm text-neutral-600">{result.time}ms</p>
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 p-3 bg-red-50 rounded text-sm">
                      <p className="font-medium text-red-800">Error:</p>
                      <pre className="text-red-700 whitespace-pre-wrap">
                        {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                        Response Data
                      </summary>
                      <pre className="mt-2 p-3 bg-neutral-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">
                    Success: {results.filter(r => r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-orange-600 font-medium">
                    Client Errors (4xx): {results.filter(r => r.status >= 400 && r.status < 500).length}
                  </span>
                </div>
                <div>
                  <span className="text-red-600 font-medium">
                    Server Errors: {results.filter(r => r.status >= 500 || r.status === 'error').length}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ApiTestPage;