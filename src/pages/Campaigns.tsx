import { useState } from 'react';
import { Plus, Users, Edit, Trash2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useCampaigns } from '@/contexts/CampaignContext';
import { useAuth } from '@/contexts/AuthContext';

const Campaigns = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    type: 'seller',
    status: 'draft'
  });
  const [campaignBeingEdited, setCampaignBeingEdited] = useState<string | null>(null);
  const [showUserAssignDialog, setShowUserAssignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showViewDetailsDialog, setShowViewDetailsDialog] = useState(false);
  const [campaignToView, setCampaignToView] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { toast } = useToast();
  const { accessibleCampaigns, addCampaign, updateCampaign, deleteCampaign, assignUserToCampaign, removeUserFromCampaign, getCampaign } = useCampaigns();
  const { users, currentUser, isAdmin } = useAuth();
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleAddCampaign = () => {
    if (!newCampaign.name) {
      toast({
        title: "Error",
        description: "Campaign name is required",
        variant: "destructive"
      });
      return;
    }
    
    addCampaign({
      name: newCampaign.name,
      description: newCampaign.description,
      status: newCampaign.status as 'draft' | 'active' | 'paused' | 'completed',
      type: newCampaign.type as 'seller' | 'buyer' | 'both',
      leads: [],
      startDate: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.id || '1',
      assignedUsers: [],
    });
    
    setNewCampaign({
      name: '',
      description: '',
      type: 'seller',
      status: 'draft'
    });
    
    toast({
      title: "Success",
      description: "Campaign created successfully"
    });
  };
  
  const handleUpdateCampaign = () => {
    if (!campaignBeingEdited) return;
    
    updateCampaign(campaignBeingEdited, {
      name: newCampaign.name,
      description: newCampaign.description,
      status: newCampaign.status as 'draft' | 'active' | 'paused' | 'completed',
      type: newCampaign.type as 'seller' | 'buyer' | 'both',
    });
    
    setCampaignBeingEdited(null);
    setNewCampaign({
      name: '',
      description: '',
      type: 'seller',
      status: 'draft'
    });
    setShowEditDialog(false);
    
    toast({
      title: "Success",
      description: "Campaign updated successfully"
    });
  };
  
  const handleDeleteCampaign = (id: string) => {
    deleteCampaign(id);
    toast({
      title: "Success",
      description: "Campaign deleted successfully"
    });
  };
  
  const handleEditCampaign = (id: string) => {
    const campaign = accessibleCampaigns.find(c => c.id === id);
    if (!campaign) return;
    
    setCampaignBeingEdited(id);
    setNewCampaign({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status
    });
    setShowEditDialog(true);
  };
  
  const handleViewCampaign = (id: string) => {
    setCampaignToView(id);
    setShowViewDetailsDialog(true);
  };
  
  const handleAssignUser = (campaignId: string, userId: string) => {
    assignUserToCampaign(campaignId, userId);
    toast({
      title: "Success",
      description: "User assigned to campaign"
    });
  };
  
  const handleRemoveUser = (campaignId: string, userId: string) => {
    removeUserFromCampaign(campaignId, userId);
    toast({
      title: "Success",
      description: "User removed from campaign"
    });
  };
  
  const openUserAssignDialog = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setShowUserAssignDialog(true);
  };
  
  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500">Draft</Badge>;
    }
  };
  
  const getCampaignTypeBadge = (type: string) => {
    switch (type) {
      case 'seller':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-200">Seller</Badge>;
      case 'buyer':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-200">Buyer</Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-200">Both</Badge>;
      default:
        return null;
    }
  };
  
  // If not admin and not a campaigner, show access denied
  if (!isAdmin && currentUser?.role !== 'campaigner') {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <Navbar toggleSidebar={handleToggleSidebar} />
          
          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="flex flex-col items-center justify-center h-64">
              <h1 className="text-2xl font-bold text-center mb-4">Access Denied</h1>
              <p className="text-center text-muted-foreground">
                You don't have permission to access the campaign management features.
              </p>
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
        <Navbar toggleSidebar={handleToggleSidebar} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Campaign Management</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>New Campaign</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new campaign
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input 
                      id="name" 
                      value={newCampaign.name} 
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newCampaign.description} 
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                      placeholder="Enter campaign description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Campaign Type</Label>
                      <Select 
                        value={newCampaign.type} 
                        onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seller">Seller</SelectItem>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={newCampaign.status} 
                        onValueChange={(value) => setNewCampaign({...newCampaign, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={handleAddCampaign}>Create Campaign</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="seller">Seller Campaigns</TabsTrigger>
              <TabsTrigger value="buyer">Buyer Campaigns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="glass-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{campaign.name}</CardTitle>
                        {getCampaignStatusBadge(campaign.status)}
                      </div>
                      <CardDescription>{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {getCampaignTypeBadge(campaign.type)}
                        <span className="text-sm text-muted-foreground">
                          Started: {new Date(campaign.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Leads</p>
                          <p className="text-2xl font-bold">{campaign.leads.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Team</p>
                          <p className="text-2xl font-bold">{campaign.assignedUsers.length}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => openUserAssignDialog(campaign.id)}>
                        <Users className="h-4 w-4 mr-1" />
                        Manage Team
                      </Button>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditCampaign(campaign.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleViewCampaign(campaign.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleCampaigns
                  .filter(campaign => campaign.status === 'active')
                  .map((campaign) => (
                    <Card key={campaign.id} className="glass-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{campaign.name}</CardTitle>
                          {getCampaignStatusBadge(campaign.status)}
                        </div>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          {getCampaignTypeBadge(campaign.type)}
                          <span className="text-sm text-muted-foreground">
                            Started: {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Leads</p>
                            <p className="text-2xl font-bold">{campaign.leads.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Team</p>
                            <p className="text-2xl font-bold">{campaign.assignedUsers.length}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={() => openUserAssignDialog(campaign.id)}>
                          <Users className="h-4 w-4 mr-1" />
                          Manage Team
                        </Button>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditCampaign(campaign.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="seller" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleCampaigns
                  .filter(campaign => campaign.type === 'seller')
                  .map((campaign) => (
                    <Card key={campaign.id} className="glass-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{campaign.name}</CardTitle>
                          {getCampaignStatusBadge(campaign.status)}
                        </div>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          {getCampaignTypeBadge(campaign.type)}
                          <span className="text-sm text-muted-foreground">
                            Started: {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Leads</p>
                            <p className="text-2xl font-bold">{campaign.leads.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Team</p>
                            <p className="text-2xl font-bold">{campaign.assignedUsers.length}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={() => openUserAssignDialog(campaign.id)}>
                          <Users className="h-4 w-4 mr-1" />
                          Manage Team
                        </Button>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditCampaign(campaign.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleCampaigns
                  .filter(campaign => campaign.type === 'buyer')
                  .map((campaign) => (
                    <Card key={campaign.id} className="glass-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{campaign.name}</CardTitle>
                          {getCampaignStatusBadge(campaign.status)}
                        </div>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          {getCampaignTypeBadge(campaign.type)}
                          <span className="text-sm text-muted-foreground">
                            Started: {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Leads</p>
                            <p className="text-2xl font-bold">{campaign.leads.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Team</p>
                            <p className="text-2xl font-bold">{campaign.assignedUsers.length}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={() => openUserAssignDialog(campaign.id)}>
                          <Users className="h-4 w-4 mr-1" />
                          Manage Team
                        </Button>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditCampaign(campaign.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Dialog for assigning users to campaign */}
          <Dialog open={showUserAssignDialog} onOpenChange={setShowUserAssignDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Campaign Team</DialogTitle>
                <DialogDescription>
                  Assign or remove users from this campaign
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-2">Campaign Users</h3>
                <div className="border rounded-md divide-y">
                  {users
                    .filter(user => user.role === 'campaigner')
                    .map(user => {
                      const campaign = selectedCampaign 
                        ? accessibleCampaigns.find(c => c.id === selectedCampaign) 
                        : null;
                      const isAssigned = campaign?.assignedUsers.includes(user.id);
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          {isAssigned ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => selectedCampaign && handleRemoveUser(selectedCampaign, user.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1 text-red-500" />
                              Remove
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => selectedCampaign && handleAssignUser(selectedCampaign, user.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                              Assign
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setShowUserAssignDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog for viewing campaign details */}
          <Dialog open={showViewDetailsDialog} onOpenChange={setShowViewDetailsDialog}>
            <DialogContent className="sm:max-w-[800px]">
              {campaignToView && (
                <>
                  <DialogHeader>
                    <DialogTitle>Campaign Details</DialogTitle>
                    <DialogDescription>
                      Detailed information about this campaign
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    {(() => {
                      const campaign = getCampaign(campaignToView);
                      if (!campaign) return <p>Campaign not found</p>;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Name</h3>
                              <p>{campaign.name}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Status</h3>
                              <div>{getCampaignStatusBadge(campaign.status)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium">Description</h3>
                            <p className="mt-1">{campaign.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Type</h3>
                              <div className="mt-1">{getCampaignTypeBadge(campaign.type)}</div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Start Date</h3>
                              <p className="mt-1">{new Date(campaign.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Leads</h3>
                              <p className="text-2xl font-bold">{campaign.leads.length}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Team Members</h3>
                              <p className="text-2xl font-bold">{campaign.assignedUsers.length}</p>
                            </div>
                          </div>
                          
                          {campaign.assignedUsers.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">Assigned Team Members</h3>
                              <div className="border rounded-md p-2">
                                {campaign.assignedUsers.map(userId => {
                                  const user = users.find(u => u.id === userId);
                                  return user ? (
                                    <div key={userId} className="flex items-center p-2">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={() => setShowViewDetailsDialog(false)}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
          
          {/* New Edit Campaign Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Campaign</DialogTitle>
                <DialogDescription>
                  Update the campaign details below
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Campaign Name</Label>
                  <Input 
                    id="edit-name" 
                    value={newCampaign.name} 
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="Enter campaign name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    value={newCampaign.description} 
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="Enter campaign description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Campaign Type</Label>
                    <Select 
                      value={newCampaign.type} 
                      onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={newCampaign.status} 
                      onValueChange={(value) => setNewCampaign({...newCampaign, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleUpdateCampaign}>Update Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Campaigns;
