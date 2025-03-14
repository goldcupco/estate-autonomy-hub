
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Building, 
  ClipboardList, 
  Home, 
  Users, 
  Phone, 
  Settings, 
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Create a global state for sidebar visibility that persists across page navigation
let globalSidebarState = true;

// Create a global event to notify all components about sidebar state changes
export const sidebarStateChangeEvent = new CustomEvent('sidebarStateChange', { 
  detail: globalSidebarState,
  bubbles: true 
});

// Update the global sidebar state and dispatch the event
export const toggleSidebar = () => {
  globalSidebarState = !globalSidebarState;
  
  // Update the event detail with the new state
  const event = new CustomEvent('sidebarStateChange', { 
    detail: globalSidebarState,
    bubbles: true 
  });
  
  window.dispatchEvent(event);
  
  // Store sidebar state in localStorage for persistence across page refreshes
  localStorage.setItem('sidebarState', globalSidebarState.toString());
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(globalSidebarState);
  
  // On first mount, check localStorage for saved state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      globalSidebarState = savedState === 'true';
      setSidebarOpen(globalSidebarState);
    }
    setMounted(true);
  }, []);
  
  // Subscribe to global sidebar state changes
  useEffect(() => {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSidebarOpen(customEvent.detail);
    };
    
    window.addEventListener('sidebarStateChange', listener as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', listener as EventListener);
    };
  }, []);

  // Sync local state with prop
  useEffect(() => {
    setSidebarOpen(isOpen);
  }, [isOpen]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location.pathname, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          mounted ? "transform-gpu" : ""
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-6 w-6 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
                RE
              </div>
              <span className={cn("transition-opacity duration-300", 
                sidebarOpen ? "opacity-100" : "opacity-0 hidden md:block"
              )}>RealEstate Pro</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto md:hidden" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Collapse toggle button - only visible on larger screens */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto hidden md:flex"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-4 space-y-2">
              <NavItem 
                to="/dashboard" 
                icon={BarChart3} 
                label="Dashboard" 
                active={location.pathname === '/dashboard'} 
                collapsed={!sidebarOpen}
              />
              <NavItem 
                to="/properties" 
                icon={Building} 
                label="Properties" 
                active={location.pathname === '/properties'} 
                collapsed={!sidebarOpen}
              />
              <NavItem 
                to="/leads" 
                icon={Users} 
                label="Leads" 
                active={location.pathname === '/leads'} 
                collapsed={!sidebarOpen}
              />
              <NavItem 
                to="/lists" 
                icon={ClipboardList} 
                label="Lists" 
                active={location.pathname === '/lists'} 
                collapsed={!sidebarOpen}
              />
              <NavItem 
                to="/calls" 
                icon={Phone} 
                label="Calls" 
                active={location.pathname === '/calls'} 
                collapsed={!sidebarOpen}
              />
              <NavItem 
                to="/documents" 
                icon={FileText} 
                label="Documents" 
                active={location.pathname === '/documents'} 
                collapsed={!sidebarOpen}
              />
            </nav>
          </ScrollArea>
          
          {/* Footer */}
          <div className="mt-auto border-t px-4 py-4">
            <NavItem 
              to="/settings" 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === '/settings'} 
              collapsed={!sidebarOpen}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

// Navigation item component with collapsible support
type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
};

function NavItem({ to, icon: Icon, label, active, collapsed }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className={cn(collapsed ? "block" : "hidden")}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Sidebar;
