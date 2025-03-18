
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './utils/initializeApp'

// Initialize the application (database, etc.) immediately and handle errors
initializeApp()
  .then(success => {
    console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
  })
  .catch(error => {
    console.error('Failed to initialize application:', error);
  });

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a root and render the app
createRoot(rootElement).render(<App />);
