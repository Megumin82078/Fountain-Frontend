import React from 'react';

function AppTest() {
  console.log('🔍 AppTest: Component rendering');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>App Test - Basic React Working</h1>
      <p>If you see this, React is working.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Debug Info:</h3>
        <p>Check browser console for errors</p>
        <p>URL: {window.location.href}</p>
      </div>
    </div>
  );
}

export default AppTest;