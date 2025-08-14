import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

console.log('main.jsx loaded');

// Create root and render
const container = document.getElementById('root');
console.log('Root container:', container);

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    console.log('Root created');
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered');
  } catch (error) {
    console.error('Error rendering app:', error);
    container.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h1 style="color: red;">Application Error</h1>
        <pre style="background: #f0f0f0; padding: 10px;">${error.toString()}\n${error.stack}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element not found!');
}