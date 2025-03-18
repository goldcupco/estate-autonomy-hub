
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

// Start the database initialization process immediately
console.log('Starting database initialization...');
initializeApp()
  .then(success => {
    console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
    
    // If initialization failed, try again after 3 seconds
    if (!success) {
      console.log('Trying initialization again in 3 seconds...');
      setTimeout(() => {
        initializeApp()
          .then(retrySuccess => {
            console.log('Retry initialization completed with status:', retrySuccess ? 'SUCCESS' : 'FAILURE');
          })
          .catch(error => {
            console.error('Failed retry initialization:', error);
          });
      }, 3000);
    }
  })
  .catch(error => {
    console.error('Failed to initialize application:', error);
  });
