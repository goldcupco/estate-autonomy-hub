
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Menu, Search, User, X, UsersRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const { isAdmin } = useAuth();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/properties') return 'Properties';
    if (path === '/leads') return 'Leads';
    if (path === '/lists') return 'Lists';

    // Handle nested routes or paths with params
    if (path.startsWith('/property/')) return 'Property Details';
    
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-panel shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleSidebar}
              className="md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight hidden md:block animate-fade-in">
              {getPageTitle()}
            </h1>
          </div>

          <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 w-full max-w-md ${
            searchVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="relative px-4">
              <Input 
                placeholder="Search properties, leads, documents..." 
                className="pl-10 pr-10 py-2 w-full bg-white/90 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm"
              />
              <Search className="absolute left-8 top-2.5 h-4 w-4 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-6 top-1.5 h-7 w-7"
                onClick={() => setSearchVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!searchVisible && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex"
                onClick={() => setSearchVisible(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative group"
                asChild
              >
                <Link to="/access-management" title="Manage User Access">
                  <UsersRound className="h-5 w-5" />
                  <span className="sr-only">Manage Access</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </Link>
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1"
                asChild
              >
                <Link to="/access-management">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Manage Access</span>
                  <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">Admin</Badge>
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 animate-scale-in">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                {isAdmin && (
                  <Link to="/access-management" className="w-full">
                    <DropdownMenuItem>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Manage Access
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
