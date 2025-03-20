
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/toaster'
import { initializeDatabase } from './utils/initializeApp'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize database to ensure all required tables exist
initializeDatabase()
  .then(result => {
    if (result.success) {
      console.log('Database initialization successful');
    } else {
      console.error('Database initialization failed:', result.error);
    }
  })
  .catch(error => {
    console.error('Unexpected error during database initialization:', error);
  });

// Create a root and render the app with the Toaster component
createRoot(rootElement).render(
  <>
    <App />
    <Toaster />
  </>
);

console.log('Application initialized successfully');
