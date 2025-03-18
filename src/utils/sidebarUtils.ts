
/**
 * Utility functions related to sidebar state management
 */

/**
 * Toggles the sidebar state and dispatches a custom event to notify components
 * Also stores the new state in localStorage for persistence
 */
export const toggleSidebar = () => {
  // Get current state from localStorage
  const currentState = localStorage.getItem('sidebarState') === 'true';
  
  // Toggle state
  const newState = !currentState;
  
  // Save new state to localStorage
  localStorage.setItem('sidebarState', String(newState));
  
  // Dispatch custom event to notify components
  const event = new CustomEvent('sidebarStateChange', { 
    detail: newState,
    bubbles: true 
  });
  window.dispatchEvent(event);
  
  return newState;
};
