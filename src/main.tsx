
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/toaster'
import { initializeDatabase } from './utils/initializeApp'
import { toast } from 'sonner'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a root and render the app with the Toaster component
const root = createRoot(rootElement);
root.render(
  <>
    <App />
    <Toaster />
  </>
);

// Initialize database in the background without blocking rendering
initializeDatabase()
  .then(result => {
    if (result.success) {
      console.log('Database initialization successful');
    } else {
      console.error('Database initialization failed:', result.error);
      // Non-blocking toast notification for database issues
      toast.error('Database initialization issue. Some features may be limited.');
    }
  })
  .catch(error => {
    console.error('Unexpected error during database initialization:', error);
    // Non-blocking toast notification
    toast.error('Unable to connect to database. Some features may be unavailable.');
  });

console.log('Application initialized successfully');
