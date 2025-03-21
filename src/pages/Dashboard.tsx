import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Truck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import PropertyCard from '@/components/dashboard/PropertyCard';
import LeadTable, { Lead } from '@/components/leads/LeadTable';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { ScheduleCallModal } from '@/components/calls/ScheduleCallModal';
import { supabase } from '@/utils/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Json } from '@/integrations/supabase/types';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'For Sale' | 'Pending' | 'Sold' | 'Lead' | 'Negotiating';
  imageUrl: string;
  propertyType?: 'House' | 'Condo' | 'Land' | 'Commercial' | 'Apartment';
}

function getImageUrlFromSupabase(images: Json | null): string {
  if (!images) return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
  
  if (Array.isArray(images) && images.length > 0) {
    return typeof images[0] === 'string' 
      ? images[0] 
      : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
  }
  
  if (typeof images === 'object' && images !== null && 'url' in images) {
    return typeof (images as any).url === 'string'
      ? (images as any).url
      : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
  }
  
  return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedProperties: Property[] = data.map(property => ({
            id: property.id,
            address: property.address || '',
            city: property.city || '',
            state: property.state || '',
            zipCode: property.zip || '',
            price: property.price || 0,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            sqft: property.square_feet || 0,
            status: (property.status as Property['status']) || 'For Sale',
            imageUrl: getImageUrlFromSupabase(property.images),
            propertyType: (property.property_type as Property['propertyType']) || 'House'
          }));
          
          setProperties(formattedProperties);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };
    
    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoadingLeads(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedLeads: Lead[] = data.map(lead => ({
            id: lead.id,
            name: `${lead.first_name} ${lead.last_name}`,
            email: lead.email || '',
            phone: lead.phone || '',
            status: lead.status as Lead['status'],
            source: lead.lead_source || 'Unknown',
            dateAdded: new Date(lead.created_at).toISOString().split('T')[0],
            lastContact: lead.last_contact_date 
              ? new Date(lead.last_contact_date).toISOString().split('T')[0] 
              : new Date(lead.created_at).toISOString().split('T')[0],
            notes: []
          }));
          
          setLeads(formattedLeads);
        } else {
          setLeads([]);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setLeads([]);
      } finally {
        setIsLoadingLeads(false);
      }
    };
    
    fetchLeads();
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  const handlePropertyAdded = async (property: any) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zipCode,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          square_feet: property.sqft,
          status: property.status,
          images: property.imageUrl ? [property.imageUrl] : [],
          property_type: property.propertyType || 'House',
          user_id: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedProperty: Property = {
          id: data[0].id,
          address: data[0].address || '',
          city: data[0].city || '',
          state: data[0].state || '',
          zipCode: data[0].zip || '',
          price: data[0].price || 0,
          bedrooms: data[0].bedrooms || 0,
          bathrooms: data[0].bathrooms || 0,
          sqft: data[0].square_feet || 0,
          status: (data[0].status as Property['status']) || 'For Sale',
          imageUrl: getImageUrlFromSupabase(data[0].images),
          propertyType: (data[0].property_type as Property['propertyType']) || 'House'
        };
        
        setProperties(prev => [formattedProperty, ...prev].slice(0, 4));
      }
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const handleLeadAdded = async (lead: Lead) => {
    try {
      const [firstName, ...lastNameParts] = lead.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: firstName,
          last_name: lastName || '',
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          lead_source: lead.source,
          lead_type: 'buyer',
          user_id: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedLead: Lead = {
          id: data[0].id,
          name: `${data[0].first_name} ${data[0].last_name}`,
          email: data[0].email || '',
          phone: data[0].phone || '',
          status: data[0].status as Lead['status'],
          source: data[0].lead_source || 'Unknown',
          dateAdded: new Date(data[0].created_at).toISOString().split('T')[0],
          lastContact: data[0].last_contact_date 
            ? new Date(data[0].last_contact_date).toISOString().split('T')[0] 
            : new Date(data[0].created_at).toISOString().split('T')[0],
          notes: []
        };
        
        setLeads(prev => [formattedLead, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-8 py-8 animate-fade-in">
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
            
            <section>
              <DashboardMetrics />
            </section>
            
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Recent Properties</h2>
                <Button variant="link" onClick={() => navigate('/properties')} className="text-primary">
                  View All
                </Button>
              </div>
              
              {isLoadingProperties ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] rounded-lg" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-4">Add your first property to get started</p>
                  <Button onClick={() => setAddPropertyOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {properties.map((property, index) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      className="opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                      onClick={() => navigate(`/property/${property.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
            
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Recent Leads</h2>
                <Button variant="link" onClick={() => navigate('/leads')} className="text-primary">
                  View All
                </Button>
              </div>
              
              {isLoadingLeads ? (
                <Skeleton className="h-[300px] w-full rounded-lg" />
              ) : leads.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No leads found</h3>
                  <p className="text-muted-foreground mb-4">Add your first lead to get started</p>
                  <Button onClick={() => setAddLeadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                  </Button>
                </div>
              ) : (
                <LeadTable data={leads} />
              )}
            </section>
          </div>
        </main>
      </div>

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
