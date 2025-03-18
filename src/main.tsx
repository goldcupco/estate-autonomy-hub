
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

// Start the database initialization process with a longer delay
window.addEventListener('load', () => {
  console.log('Window loaded, initializing app in 3 seconds...');
  // Longer delay to ensure everything is fully loaded
  setTimeout(() => {
    initializeApp()
      .then(success => {
        console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
        
        // If initialization failed, try again after 5 seconds
        if (!success) {
          console.log('Trying initialization again in 5 seconds...');
          setTimeout(() => {
            initializeApp()
              .then(retrySuccess => {
                console.log('Retry initialization completed with status:', retrySuccess ? 'SUCCESS' : 'FAILURE');
              })
              .catch(error => {
                console.error('Failed retry initialization:', error);
              });
          }, 5000);
        }
      })
      .catch(error => {
        console.error('Failed to initialize application:', error);
      });
  }, 3000);
});
