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
  ChevronRight,
  Target,
  ShieldCheck,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  
  // On first mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location.pathname, onClose]);

  // Check if user should see the Campaigns link
  const shouldShowCampaigns = isAdmin || currentUser?.role === 'campaigner';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
          mounted ? "transform-gpu" : ""
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-6 w-6 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
                GC
              </div>
              <span className={cn("transition-opacity duration-300", 
                isOpen ? "opacity-100" : "opacity-0 hidden md:block"
              )}>Goldcup RE</span>
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
              onClick={() => {
                // Create and dispatch custom event
                const newState = !isOpen;
                const event = new CustomEvent('sidebarStateChange', { 
                  detail: newState,
                  bubbles: true 
                });
                window.dispatchEvent(event);
                
                // Store sidebar state in localStorage
                localStorage.setItem('sidebarState', newState.toString());
              }}
              className="ml-auto hidden md:flex"
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                collapsed={!isOpen}
              />
              <NavItem 
                to="/properties" 
                icon={Building} 
                label="Properties" 
                active={location.pathname === '/properties'} 
                collapsed={!isOpen}
              />
              <NavItem 
                to="/leads" 
                icon={Users} 
                label="Leads" 
                active={location.pathname === '/leads'} 
                collapsed={!isOpen}
              />
              <NavItem 
                to="/lists" 
                icon={ClipboardList} 
                label="Lists" 
                active={location.pathname === '/lists'} 
                collapsed={!isOpen}
              />
              {shouldShowCampaigns && (
                <NavItem 
                  to="/campaigns" 
                  icon={Target} 
                  label="Campaigns" 
                  active={location.pathname === '/campaigns'} 
                  collapsed={!isOpen}
                />
              )}
              <NavItem 
                to="/calls" 
                icon={Phone} 
                label="Calls" 
                active={location.pathname === '/calls'} 
                collapsed={!isOpen}
              />
              <NavItem 
                to="/messages" 
                icon={MessageSquare} 
                label="Messages" 
                active={location.pathname === '/messages'} 
                collapsed={!isOpen}
              />
              <NavItem 
                to="/documents" 
                icon={FileText} 
                label="Documents" 
                active={location.pathname === '/documents'} 
                collapsed={!isOpen}
              />
              {isAdmin && (
                <>
                  <NavItem 
                    to="/access-management" 
                    icon={ShieldCheck} 
                    label="Manage Access" 
                    active={location.pathname === '/access-management'} 
                    collapsed={!isOpen}
                  />
                  <NavItem 
                    to="/phone-number-management" 
                    icon={PhoneCall} 
                    label="Phone Numbers" 
                    active={location.pathname === '/phone-number-management'} 
                    collapsed={!isOpen}
                  />
                </>
              )}
            </nav>
          </ScrollArea>
          
          {/* Footer */}
          <div className="mt-auto border-t px-4 py-4">
            <NavItem 
              to="/settings" 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === '/settings'} 
              collapsed={!isOpen}
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
