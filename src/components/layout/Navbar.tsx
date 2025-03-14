import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, User, X, UsersRound, ShieldCheck, Building, FileText, Briefcase, Phone, Users, ListChecks, BarChart3, PhoneCall } from 'lucide-react';
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
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandShortcut 
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaigns } from '@/contexts/CampaignContext';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { accessibleCampaigns } = useCampaigns();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/properties') return 'Properties';
    if (path === '/leads') return 'Leads';
    if (path === '/lists') return 'Lists';
    if (path === '/phone-number-management') return 'Phone Number Management';
    if (path.startsWith('/property/')) return 'Property Details';
    
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchCategories = [
    {
      heading: 'Pages',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="mr-2 h-4 w-4" />, href: '/dashboard' },
        { id: 'properties', name: 'Properties', icon: <Building className="mr-2 h-4 w-4" />, href: '/properties' },
        { id: 'leads', name: 'Leads', icon: <Users className="mr-2 h-4 w-4" />, href: '/leads' },
        { id: 'campaigns', name: 'Campaigns', icon: <Briefcase className="mr-2 h-4 w-4" />, href: '/campaigns' },
        { id: 'lists', name: 'Lists', icon: <ListChecks className="mr-2 h-4 w-4" />, href: '/lists' },
        { id: 'contacts', name: 'Contacts', icon: <Phone className="mr-2 h-4 w-4" />, href: '/contacts' },
        { id: 'contracts', name: 'Contracts', icon: <FileText className="mr-2 h-4 w-4" />, href: '/contracts' },
        { id: 'documents', name: 'Documents', icon: <FileText className="mr-2 h-4 w-4" />, href: '/documents' }
      ]
    },
    {
      heading: 'Campaigns',
      items: accessibleCampaigns.map(campaign => ({
        id: `campaign-${campaign.id}`,
        name: campaign.name,
        icon: <Briefcase className="mr-2 h-4 w-4" />,
        href: `/campaigns?id=${campaign.id}`,
        description: campaign.description
      }))
    }
  ];

  if (isAdmin) {
    searchCategories.push({
      heading: 'Admin',
      items: [
        { id: 'user-management', name: 'User Management', icon: <Users className="mr-2 h-4 w-4" />, href: '/user-management' },
        { id: 'access-management', name: 'Access Management', icon: <ShieldCheck className="mr-2 h-4 w-4" />, href: '/access-management' },
        { id: 'phone-management', name: 'Phone Number Management', icon: <PhoneCall className="mr-2 h-4 w-4" />, href: '/phone-number-management' }
      ]
    });
  }

  const handleSelect = (href: string) => {
    setCommandOpen(false);
    navigate(href);
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
                onClick={() => setCommandOpen(true)}
                onFocus={() => setCommandOpen(true)}
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
                onClick={() => {
                  setSearchVisible(true);
                  setTimeout(() => setCommandOpen(true), 100);
                }}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
                <kbd className="pointer-events-none absolute right-1.5 top-[9px] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
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
                <Link to="/phone-number-management">
                  <PhoneCall className="h-4 w-4" />
                  <span className="hidden sm:inline">Phone Numbers</span>
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

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search across the platform..." />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              No results found.
            </div>
          </CommandEmpty>
          
          {searchCategories.map((category) => (
            <CommandGroup key={category.heading} heading={category.heading}>
              {category.items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center"
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.description && (
                    <span className="ml-2 text-xs text-muted-foreground truncate max-w-[180px]">
                      {item.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export default Navbar;
