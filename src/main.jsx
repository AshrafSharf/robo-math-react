import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'
import TestFeatures from './TestFeatures.jsx'
import { PluginInitializer } from './utils/plugin-initializer.js'

// Initialize plugins (MathJax, GSAP, etc.) before rendering React app
console.log('Starting plugin initialization...');
PluginInitializer.initialize()
  .then(() => {
    console.log('Plugins initialized successfully');

    // Hide loading screen
    const loadingElement = document.getElementById('global-loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }

    // Render React app with routing
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/test" element={<TestFeatures />} />
          </Routes>
        </BrowserRouter>
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Plugin initialization failed:', error);

    // Update loading screen to show error
    const loadingElement = document.getElementById('global-loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div style="text-align: center;">
          <h2 style="color: #d9534f;">⚠️ Initialization Failed</h2>
          <p style="color: #666;">${error.message || 'Failed to load required libraries'}</p>
          <p style="color: #999;">Please check your internet connection and refresh the page.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
  });
