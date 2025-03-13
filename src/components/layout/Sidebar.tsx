
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Handle initial mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location.pathname, onClose]);

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
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-sm transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          mounted ? "transform-gpu" : ""
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-6 w-6 rounded-md bg-primary text-white flex items-center justify-center">
                RE
              </div>
              <span className="animate-fade-in">RealEstate Pro</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto md:hidden" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
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
              />
              <NavItem 
                to="/properties" 
                icon={Building} 
                label="Properties" 
                active={location.pathname === '/properties'} 
              />
              <NavItem 
                to="/leads" 
                icon={Users} 
                label="Leads" 
                active={location.pathname === '/leads'} 
              />
              <NavItem 
                to="/lists" 
                icon={ClipboardList} 
                label="Lists" 
                active={location.pathname === '/lists'} 
              />
              <NavItem 
                to="/calls" 
                icon={Phone} 
                label="Calls" 
                active={location.pathname === '/calls'} 
              />
              <NavItem 
                to="/documents" 
                icon={FileText} 
                label="Documents" 
                active={location.pathname === '/documents'} 
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
            />
          </div>
        </div>
      </aside>
    </>
  );
}

// Navigation item component
type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
};

function NavItem({ to, icon: Icon, label, active }: NavItemProps) {
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
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="md:hidden">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Sidebar;
