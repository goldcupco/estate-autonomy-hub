
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

// Start the database initialization process
window.addEventListener('load', () => {
  console.log('Window loaded, initializing app in 1 second...');
  // Delay initialization to ensure DOM is fully loaded
  setTimeout(() => {
    initializeApp()
      .then(success => {
        console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
      })
      .catch(error => {
        console.error('Failed to initialize application:', error);
      });
  }, 1000);
});
