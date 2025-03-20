
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataUploader } from '@/components/ui/DataUploader';
import { ClipboardList, Download, Upload, Users, BarChart, Calendar, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import CampaignTracker from '@/components/campaigns/CampaignTracker';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { 
  getLists, 
  getCampaigns, 
  createList, 
  updateList, 
  deleteList, 
  exportListToCsv,
  List,
  Campaign
} from '@/services/listService';

export function Lists() {
  const { toast } = useToast();
  const [sellerData, setSellerData] = useState<any[] | null>(null);
  const [buyerData, setBuyerData] = useState<any[] | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportType, setExportType] = useState<'all' | 'seller' | 'buyer'>('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listDetailDialog, setListDetailDialog] = useState(false);
  const [listsSummary, setListsSummary] = useState<List[]>([]);
  const [campaignsData, setCampaignsData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load lists
        const lists = await getLists();
        setListsSummary(lists);
        
        // Load campaigns
        const campaigns = await getCampaigns();
        setCampaignsData(campaigns);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load lists and campaigns',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const handleSellerUploadComplete = async (data: any[]) => {
    setSellerData(data);

    // Create a new list in the database
    try {
      const newList = await createList({
        title: `Seller List - ${new Date().toLocaleDateString()}`,
        description: `Imported seller list with ${data.length} records`,
        count: data.length,
        type: 'seller'
      });
      
      if (newList) {
        // Refresh the lists
        const lists = await getLists();
        setListsSummary(lists);
        
        toast({
          title: "Seller List Uploaded",
          description: `Successfully imported ${data.length} seller records and created a new list.`,
        });
      }
    } catch (error) {
      console.error('Error creating seller list:', error);
      toast({
        title: "Seller List Uploaded",
        description: `Successfully imported ${data.length} seller records. However, failed to save to database.`,
      });
    }
  };

  const handleBuyerUploadComplete = async (data: any[]) => {
    setBuyerData(data);

    // Create a new list in the database
    try {
      const newList = await createList({
        title: `Buyer List - ${new Date().toLocaleDateString()}`,
        description: `Imported buyer list with ${data.length} records`,
        count: data.length,
        type: 'buyer'
      });
      
      if (newList) {
        // Refresh the lists
        const lists = await getLists();
        setListsSummary(lists);
        
        toast({
          title: "Buyer List Uploaded",
          description: `Successfully imported ${data.length} buyer records and created a new list.`,
        });
      }
    } catch (error) {
      console.error('Error creating buyer list:', error);
      toast({
        title: "Buyer List Uploaded",
        description: `Successfully imported ${data.length} buyer records. However, failed to save to database.`,
      });
    }
  };

  const filterListsByType = (type: string) => {
    if (type === 'all') return listsSummary;
    return listsSummary.filter(list => list.type === type);
  };

  const filterCampaignsByType = (type: string) => {
    if (type === 'all') return campaignsData;
    return campaignsData.filter(campaign => campaign.type === type);
  };

  const handleExport = async () => {
    let dataToExport;
    
    if (exportType === 'seller') {
      dataToExport = filterListsByType('seller');
    } else if (exportType === 'buyer') {
      dataToExport = filterListsByType('buyer');
    } else {
      dataToExport = listsSummary;
    }
    
    const headers = ['title', 'description', 'count', 'lastUpdated', 'type'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => 
        headers.map(header => `"${(item as any)[header]}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportType}-lists-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `Successfully exported ${dataToExport.length} ${exportType} list records.`,
    });
  };

  const handleViewList = (list: List) => {
    setSelectedList(list);
    setListDetailDialog(true);
  };

  const handleExportList = async (list: List) => {
    try {
      const csvContent = await exportListToCsv(list);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${list.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "List Exported",
        description: `Successfully exported ${list.title} list.`,
      });
    } catch (error) {
      console.error('Error exporting list:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export the list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      const success = await deleteList(id);
      
      if (success) {
        // Update the UI by filtering out the deleted list
        setListsSummary(prev => prev.filter(list => list.id !== id));
        
        // Close the dialog if it's open
        if (selectedList?.id === id) {
          setListDetailDialog(false);
          setSelectedList(null);
        }
        
        toast({
          title: "List Deleted",
          description: "The list has been successfully deleted."
        });
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the list. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-6 py-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">Lists & Campaigns</h1>
              <div className="flex gap-2">
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  className="flex items-center gap-2 animate-scale-in animate-delay-100"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button 
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center gap-2 animate-scale-in"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </Button>
              </div>
            </div>
            
            <Tabs 
              defaultValue="all" 
              className="w-full animate-scale-in"
              onValueChange={(value) => {
                if (['all', 'seller', 'buyer'].includes(value)) {
                  setExportType(value as 'all' | 'seller' | 'buyer');
                }
              }}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Lists</TabsTrigger>
                <TabsTrigger value="seller">Seller Lists</TabsTrigger>
                <TabsTrigger value="buyer">Buyer Lists</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
              </TabsList>
              
              {/* All Lists Tab */}
              <TabsContent value="all" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    // Loading state
                    Array(6).fill(0).map((_, index) => (
                      <Card key={index} className="glass-card animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : filterListsByType('all').length > 0 ? (
                    filterListsByType('all').map((list, index) => (
                      <Card key={list.id} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader>
                          <CardTitle>{list.title}</CardTitle>
                          <CardDescription>{list.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{list.count}</div>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {list.lastUpdated}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleViewList(list)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportList(list)}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-muted-foreground">No lists found. Upload some data to create lists.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Seller Lists Tab */}
              <TabsContent value="seller" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    // Loading state
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} className="glass-card animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : filterListsByType('seller').length > 0 ? (
                    filterListsByType('seller').map((list, index) => (
                      <Card key={list.id} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader>
                          <CardTitle>{list.title}</CardTitle>
                          <CardDescription>{list.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{list.count}</div>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {list.lastUpdated}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleViewList(list)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportList(list)}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-muted-foreground">No seller lists found. Upload some seller data to create lists.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Buyer Lists Tab */}
              <TabsContent value="buyer" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    // Loading state
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} className="glass-card animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : filterListsByType('buyer').length > 0 ? (
                    filterListsByType('buyer').map((list, index) => (
                      <Card key={list.id} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader>
                          <CardTitle>{list.title}</CardTitle>
                          <CardDescription>{list.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{list.count}</div>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {list.lastUpdated}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleViewList(list)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportList(list)}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-muted-foreground">No buyer lists found. Upload some buyer data to create lists.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    // Loading state
                    Array(4).fill(0).map((_, index) => (
                      <Card key={index} className="glass-card animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-8 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-8 bg-gray-200 rounded w-12"></div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <div className="h-8 bg-gray-200 rounded w-28"></div>
                          <div className="flex gap-1">
                            <div className="h-8 bg-gray-200 rounded w-8"></div>
                            <div className="h-8 bg-gray-200 rounded w-8"></div>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : filterCampaignsByType('all').length > 0 ? (
                    filterCampaignsByType('all').map((campaign, index) => (
                      <Card key={campaign.id} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle>{campaign.title}</CardTitle>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Contacts</p>
                              <p className="text-2xl font-bold">{campaign.contacts}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Responses</p>
                              <p className="text-2xl font-bold">{campaign.responses}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              {campaign.type === 'seller' ? 'Seller Campaign' : 'Buyer Campaign'} • Last updated: {campaign.lastUpdated}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setActiveCampaign(campaign.id)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[900px]">
                              <DialogHeader>
                                <DialogTitle>{campaign.title}</DialogTitle>
                                <DialogDescription>
                                  {campaign.description}
                                </DialogDescription>
                              </DialogHeader>
                              {activeCampaign && <CampaignTracker campaignId={activeCampaign} />}
                            </DialogContent>
                          </Dialog>
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon">
                              <BarChart className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-muted-foreground">No campaigns found. Create a campaign from your lists.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="glass-card animate-scale-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Upload Seller List
                      </CardTitle>
                      <CardDescription>
                        Import a CSV file containing seller information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataUploader 
                        title="Upload Seller Data"
                        description="CSV file should include name, contact, property details"
                        onUploadComplete={handleSellerUploadComplete}
                      />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        For best results, include columns for name, address, phone, email and property details.
                      </p>
                    </CardFooter>
                  </Card>
                  
                  <Card className="glass-card animate-scale-in animate-delay-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Upload Buyer List
                      </CardTitle>
                      <CardDescription>
                        Import a CSV file containing buyer information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataUploader 
                        title="Upload Buyer Data"
                        description="CSV file should include name, contact, preferences"
                        onUploadComplete={handleBuyerUploadComplete}
                      />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        For best results, include columns for name, contact information, budget, and property preferences.
                      </p>
                    </CardFooter>
                  </Card>
                </div>
                
                {(sellerData || buyerData) && (
                  <Card className="mt-8 animate-fade-in">
                    <CardHeader>
                      <CardTitle>Uploaded Data Preview</CardTitle>
                      <CardDescription>
                        {sellerData ? `${sellerData.length} seller records` : ''} 
                        {sellerData && buyerData ? ' and ' : ''}
                        {buyerData ? `${buyerData.length} buyer records` : ''} uploaded
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto">
                        {sellerData && (
                          <div className="mb-4">
                            <h3 className="font-medium mb-2">Seller Data:</h3>
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                              {JSON.stringify(sellerData.slice(0, 5), null, 2)}
                              {sellerData.length > 5 && <div className="text-center mt-2">... and {sellerData.length - 5} more records</div>}
                            </pre>
                          </div>
                        )}
                        
                        {buyerData && (
                          <div>
                            <h3 className="font-medium mb-2">Buyer Data:</h3>
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                              {JSON.stringify(buyerData.slice(0, 5), null, 2)}
                              {buyerData.length > 5 && <div className="text-center mt-2">... and {buyerData.length - 5} more records</div>}
                            </pre>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end">
                      <Button variant="outline" onClick={() => {
                        setSellerData(null);
                        setBuyerData(null);
                      }}>Cancel</Button>
                      <Button onClick={async () => {
                        try {
                          // Create a new list for any uploaded data
                          if (sellerData) {
                            const newList = await createList({
                              title: `Seller List - ${new Date().toLocaleDateString()}`,
                              description: `Imported seller list with ${sellerData.length} records`,
                              count: sellerData.length,
                              type: 'seller'
                            });
                            
                            if (newList) {
                              toast({
                                title: "Seller List Created",
                                description: `Created a new list with ${sellerData.length} seller records.`,
                              });
                            }
                          }
                          
                          if (buyerData) {
                            const newList = await createList({
                              title: `Buyer List - ${new Date().toLocaleDateString()}`,
                              description: `Imported buyer list with ${buyerData.length} records`,
                              count: buyerData.length,
                              type: 'buyer'
                            });
                            
                            if (newList) {
                              toast({
                                title: "Buyer List Created",
                                description: `Created a new list with ${buyerData.length} buyer records.`,
                              });
                            }
                          }
                          
                          // Refresh the lists
                          const lists = await getLists();
                          setListsSummary(lists);
                          
                          // Clear the uploaded data
                          setSellerData(null);
                          setBuyerData(null);
                        } catch (error) {
                          console.error('Error adding to list:', error);
                          toast({
                            title: "Error",
                            description: "Failed to create list from uploaded data.",
                            variant: "destructive"
                          });
                        }
                      }}>Add to List</Button>
                      <Button>Create Campaign</Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Lists</DialogTitle>
            <DialogDescription>
              Upload your seller or buyer lists
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Seller List</CardTitle>
                <CardDescription>Import seller data</CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Seller Data"
                  description="CSV with seller contacts"
                  onUploadComplete={handleSellerUploadComplete}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Buyer List</CardTitle>
                <CardDescription>Import buyer data</CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Buyer Data"
                  description="CSV with buyer contacts"
                  onUploadComplete={handleBuyerUploadComplete}
                />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={listDetailDialog} onOpenChange={setListDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedList?.title}</DialogTitle>
            <DialogDescription>
              {selectedList?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Count</p>
                  <p className="text-xl font-bold">{selectedList?.count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-xl capitalize">{selectedList?.type}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">{selectedList?.lastUpdated}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Sample Data</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>This is a placeholder for list data visualization.</p>
                  <p className="text-muted-foreground mt-2">In a real application, this would display actual contacts from the list.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedList) {
                  handleDeleteList(selectedList.id);
                }
              }}
            >
              Delete List
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setListDetailDialog(false)}>Close</Button>
              <Button onClick={() => {
                if (selectedList) {
                  handleExportList(selectedList);
                }
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export List
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Lists;
