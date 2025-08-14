// Backup of original main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug logging
console.log('🚀 Main.jsx: Starting application');
console.log('🚀 Main.jsx: Root element:', document.getElementById('root'));

try {
  const root = createRoot(document.getElementById('root'));
  console.log('🚀 Main.jsx: Root created successfully');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('🚀 Main.jsx: App rendered successfully');
} catch (error) {
  console.error('❌ Main.jsx: Error rendering app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Application Error</h1>
      <p>There was an error starting the application. Please check the console for details.</p>
      <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${error.toString()}</pre>
    </div>
  `;
}