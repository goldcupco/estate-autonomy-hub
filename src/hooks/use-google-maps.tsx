
import { useState, useEffect } from 'react';

// Define Google Maps Window Interface
declare global {
  interface Window {
    google: {
      maps: any;
    };
    [key: string]: any; // Allow dynamic properties for callback names
  }
}

export const useGoogleMapsApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    // If no API key, set an error and don't try to load the API
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.'));
      return;
    }
    
    // Check if the API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    
    // Create a unique callback name
    const callbackName = `gmapsCallback_${Math.round(Date.now() * Math.random())}`;
    
    // Define the callback function
    window[callbackName] = function() {
      setIsLoaded(true);
      delete window[callbackName];
    };
    
    // Create the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Handle errors
    script.onerror = (error) => {
      setLoadError(new Error('Failed to load Google Maps API'));
      delete window[callbackName];
    };
    
    // Append the script to the document
    document.head.appendChild(script);
    
    // Clean up on unmount
    return () => {
      // Remove the script if it's still loading
      if (!isLoaded) {
        document.head.removeChild(script);
        delete window[callbackName];
      }
    };
  }, [apiKey]);
  
  return { isLoaded, loadError };
};
