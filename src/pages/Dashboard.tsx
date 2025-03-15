
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Truck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import PropertyCard from '@/components/dashboard/PropertyCard';
import LeadTable, { Lead } from '@/components/leads/LeadTable';
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { ScheduleCallModal } from '@/components/calls/ScheduleCallModal';

// Dummy property data
const recentProperties = [
  {
    id: '1',
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  },
  {
    id: '2',
    address: '456 Oak Avenue',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    price: 625000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    status: 'Pending' as const,
    imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c',
  },
  {
    id: '3',
    address: '789 Pine Lane',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    price: 380000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    status: 'Sold' as const,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  },
  {
    id: '4',
    address: '101 Lake Drive',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    price: 750000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2800,
    status: 'Lead' as const,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
  },
];

// Dummy lead data
const recentLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'New',
    source: 'Website Inquiry',
    dateAdded: '2023-06-15',
    lastContact: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    status: 'Contacted',
    source: 'Zillow',
    dateAdded: '2023-06-12',
    lastContact: '2023-06-14',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    status: 'Qualified',
    source: 'Referral',
    dateAdded: '2023-06-10',
    lastContact: '2023-06-13',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 321-6547',
    status: 'Negotiating',
    source: 'Direct Mail',
    dateAdded: '2023-06-08',
    lastContact: '2023-06-12',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '(555) 789-4561',
    status: 'Lost',
    source: 'Cold Call',
    dateAdded: '2023-06-05',
    lastContact: '2023-06-10',
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Modal states
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  
  // Local state for properties and leads
  const [properties, setProperties] = useState(recentProperties);
  const [leads, setLeads] = useState(recentLeads);

  // Subscribe to global sidebar state changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  // On mount, initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  // Handler for adding a new property
  const handlePropertyAdded = (property: any) => {
    setProperties(prev => [property, ...prev]);
  };

  // Handler for adding a new lead
  const handleLeadAdded = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-8 py-8 animate-fade-in">
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                className="flex items-center gap-2 animate-scale-in"
                onClick={() => setAddPropertyOpen(true)}
              >
                <Building className="h-4 w-4" />
                Add Property
              </Button>
              <Button 
                className="flex items-center gap-2 animate-scale-in animate-delay-100" 
                variant="outline"
                onClick={() => setAddLeadOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add Lead
              </Button>
              <Button 
                className="flex items-center gap-2 animate-scale-in animate-delay-200" 
                variant="outline"
                onClick={() => setScheduleCallOpen(true)}
              >
                <Truck className="h-4 w-4" />
                Schedule Call
              </Button>
            </div>
            
            {/* Metrics */}
            <section>
              <DashboardMetrics />
            </section>
            
            {/* Recent Properties */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Recent Properties</h2>
                <Button variant="link" onClick={() => navigate('/properties')} className="text-primary">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.slice(0, 4).map((property, index) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    className="opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    onClick={() => navigate(`/property/${property.id}`)}
                  />
                ))}
              </div>
            </section>
            
            {/* Recent Leads */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Recent Leads</h2>
                <Button variant="link" onClick={() => navigate('/leads')} className="text-primary">
                  View All
                </Button>
              </div>
              <LeadTable data={leads.slice(0, 5)} />
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPropertyModal 
        open={addPropertyOpen} 
        onOpenChange={setAddPropertyOpen} 
        onPropertyAdded={handlePropertyAdded}
      />
      <AddLeadModal 
        open={addLeadOpen} 
        onOpenChange={setAddLeadOpen} 
        onLeadAdded={handleLeadAdded}
      />
      <ScheduleCallModal 
        open={scheduleCallOpen} 
        onOpenChange={setScheduleCallOpen} 
      />
    </div>
  );
}

export default Dashboard;
