import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Lead, Note } from '@/components/leads/types';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { LeadNotes } from '@/components/leads/LeadNotes';
import { LeadActions } from '@/components/leads/LeadActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { initialLeadsData } from '@/components/leads/LeadData';
import { supabase } from '@/utils/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const LeadDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.warn('Error fetching lead from Supabase:', error);
          throw error;
        }
        
        if (data) {
          const formattedLead: Lead = {
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email || '',
            phone: data.phone || '',
            status: data.status as Lead['status'],
            source: data.lead_source || 'Unknown',
            dateAdded: new Date(data.created_at).toISOString().split('T')[0],
            lastContact: data.last_contact_date 
              ? new Date(data.last_contact_date).toISOString().split('T')[0] 
              : new Date(data.created_at).toISOString().split('T')[0],
            notes: [],
            flaggedForNextStage: false,
            readyToMove: false,
            doNotContact: false
          };
          
          setLead(formattedLead);
        } else {
          const foundLead = initialLeadsData.find(lead => lead.id === id);
          if (foundLead) {
            setLead(foundLead);
          } else {
            toast({
              title: "Lead not found",
              description: `Could not find lead with ID ${id}`,
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching lead details:', error);
        
        const foundLead = initialLeadsData.find(lead => lead.id === id);
        if (foundLead) {
          setLead(foundLead);
        } else {
          toast({
            title: "Lead not found",
            description: `Could not find lead with ID ${id}`,
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLead();
  }, [id, toast]);

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
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  const handleAddNote = async (leadId: string, note: Omit<Note, 'id'>) => {
    try {
      const newNote: Note = {
        ...note,
        id: `note-${Date.now()}`
      };
      
      setLead(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [...(prev.notes || []), newNote],
          lastContact: new Date().toISOString().split('T')[0]
        };
      });
      
      const { error } = await supabase
        .from('leads')
        .update({
          last_contact_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (error) throw error;
      
      toast({
        title: "Note added",
        description: "Your note has been added to the lead"
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Note added locally",
        description: "Note was saved locally but not to the database",
        variant: "destructive"
      });
    }
  };

  const handleEditLead = async (updatedLead: Lead) => {
    try {
      const [firstName, ...lastNameParts] = updatedLead.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const { error } = await supabase
        .from('leads')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          email: updatedLead.email,
          phone: updatedLead.phone,
          status: updatedLead.status,
          lead_source: updatedLead.source,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedLead.id);
      
      if (error) throw error;
      
      setLead(updatedLead);
      
      toast({
        title: "Lead updated",
        description: "Lead details have been updated successfully"
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      
      setLead(updatedLead);
      
      toast({
        title: "Update partially successful",
        description: "Lead updated locally but database update failed",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <Navbar toggleSidebar={() => toggleSidebar()} />
          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="grid gap-6 md:grid-cols-12">
              <Skeleton className="md:col-span-8 h-[200px] rounded-md" />
              <Skeleton className="md:col-span-4 h-[200px] rounded-md" />
              <Skeleton className="md:col-span-12 h-[400px] rounded-md" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <Navbar toggleSidebar={() => toggleSidebar()} />
          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="flex justify-center items-center h-64">
              <p>Lead not found. <Link to="/leads" className="text-primary hover:underline">Return to leads</Link></p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/leads">Leads</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{lead.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Lead Details</h1>
            <Link to="/leads">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-8 glass-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{lead.name}</CardTitle>
                  <LeadStatusBadge status={lead.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-sm">{lead.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="text-sm">{lead.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                    <p className="text-sm">{lead.source}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                    <p className="text-sm">{lead.dateAdded}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Contact</h3>
                    <p className="text-sm">{lead.lastContact}</p>
                  </div>
                  {lead.doNotContact && (
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Do Not Contact
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-4 glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <LeadActions 
                    lead={lead} 
                    onEdit={handleEditLead} 
                    onAddNote={handleAddNote}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-12 glass-card">
              <CardContent className="pt-6">
                <Tabs defaultValue="notes">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes">Notes & Activity</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  <TabsContent value="notes" className="pt-4">
                    {lead.notes && lead.notes.length > 0 ? (
                      <LeadNotes 
                        lead={lead}
                        onAddNote={handleAddNote}
                      />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No notes found for this lead.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="communications" className="pt-4">
                    <p className="text-center text-muted-foreground py-8">Communication history would be shown here.</p>
                  </TabsContent>
                  <TabsContent value="documents" className="pt-4">
                    <p className="text-center text-muted-foreground py-8">Documents related to this lead would be shown here.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDetail;
