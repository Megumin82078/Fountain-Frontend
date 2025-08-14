import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple React Test</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>
        Click me to test interaction
      </button>
    </div>
  );
}

// Render the simple app
const root = createRoot(document.getElementById('root'));
root.render(<TestApp />);