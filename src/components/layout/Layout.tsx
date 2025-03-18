
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Initialize sidebar state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);
  
  const handleToggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Save to localStorage
    localStorage.setItem('sidebarState', String(newState));
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar toggleSidebar={handleToggleSidebar} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`pt-16 flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
          <div className="container px-4 py-4 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
