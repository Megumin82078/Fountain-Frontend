import React from 'react';
import { AppProvider } from './context/AppContext';
import SimpleErrorBoundary from './components/common/ErrorBoundary.simple';

// Test 3: Add SimpleErrorBoundary
function App() {
  console.log('🔍 App.simple: Starting to render with SimpleErrorBoundary');
  
  return (
    <SimpleErrorBoundary>
      <AppProvider>
        <div style={{ padding: '20px' }}>
          <h1>App Simple Test with SimpleErrorBoundary</h1>
          <p>Testing SimpleErrorBoundary + AppProvider</p>
        </div>
      </AppProvider>
    </SimpleErrorBoundary>
  );
}

export default App;