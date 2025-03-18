
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './utils/initializeApp'
import { Toaster } from './components/ui/toaster'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a root and render the app with the Toaster component
createRoot(rootElement).render(
  <>
    <App />
    <Toaster />
  </>
);

// Initialize the application (database, etc.) after rendering
// This ensures the toast notifications will be visible
setTimeout(() => {
  initializeApp()
    .then(success => {
      console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
    })
    .catch(error => {
      console.error('Failed to initialize application:', error);
    });
}, 500);
