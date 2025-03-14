
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, UserPlus, Edit, Trash2, ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useCampaigns } from '@/contexts/CampaignContext';

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'campaigner' as UserRole,
  });
  const [userBeingEdited, setUserBeingEdited] = useState<string | null>(null);
  const [showCampaignAccessDialog, setShowCampaignAccessDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser, isAdmin } = useAuth();
  const { campaigns, assignUserToCampaign, removeUserFromCampaign, getUserCampaigns } = useCampaigns();
  const navigate = useNavigate();
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    
    addUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      campaigns: []
    });
    
    setNewUser({
      name: '',
      email: '',
      role: 'campaigner'
    });
    
    toast({
      title: "Success",
      description: "User added successfully"
    });
  };
  
  const handleUpdateUser = () => {
    if (!userBeingEdited) return;
    
    updateUser(userBeingEdited, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    setUserBeingEdited(null);
    setNewUser({
      name: '',
      email: '',
      role: 'campaigner'
    });
    
    toast({
      title: "Success",
      description: "User updated successfully"
    });
  };
  
  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };
  
  const handleEditUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    setUserBeingEdited(id);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };
  
  const openCampaignAccessDialog = (userId: string) => {
    setSelectedUser(userId);
    setShowCampaignAccessDialog(true);
  };
  
  const handleAssignCampaign = (userId: string, campaignId: string) => {
    assignUserToCampaign(campaignId, userId);
    toast({
      title: "Success",
      description: "Campaign assigned to user"
    });
  };
  
  const handleRemoveCampaign = (userId: string, campaignId: string) => {
    removeUserFromCampaign(campaignId, userId);
    toast({
      title: "Success",
      description: "Campaign access revoked from user"
    });
  };
  
  // If not an admin, redirect to dashboard
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={handleToggleSidebar} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Settings
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{userBeingEdited ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                      {userBeingEdited 
                        ? 'Update the user information below' 
                        : 'Fill in the details to create a new user'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={newUser.name} 
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        placeholder="Enter user's full name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={newUser.email} 
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrator">Administrator</SelectItem>
                          <SelectItem value="campaigner">Campaigner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    {userBeingEdited ? (
                      <Button onClick={handleUpdateUser}>Update User</Button>
                    ) : (
                      <Button onClick={handleAddUser}>Add User</Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Administrators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter(user => user.role === 'administrator')
                    .map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Campaigners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter(user => user.role === 'campaigner')
                    .map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mr-2"
                            onClick={() => openCampaignAccessDialog(user.id)}
                          >
                            Manage Access
                          </Button>
                          <Badge variant="outline" className="mr-2">
                            {user.campaigns.length} Campaigns
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Dialog for managing campaign access */}
          <Dialog open={showCampaignAccessDialog} onOpenChange={setShowCampaignAccessDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Campaign Access</DialogTitle>
                <DialogDescription>
                  Grant or revoke campaign access for this user
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-2">Available Campaigns</h3>
                <div className="border rounded-md divide-y max-h-[50vh] overflow-y-auto">
                  {campaigns.map(campaign => {
                    const selectedUserObj = selectedUser 
                      ? users.find(u => u.id === selectedUser) 
                      : null;
                    const hasAccess = selectedUserObj?.campaigns.includes(campaign.id);
                    
                    return (
                      <div key={campaign.id} className="flex items-center justify-between p-3">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.type} campaign</p>
                        </div>
                        {hasAccess ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => selectedUser && handleRemoveCampaign(selectedUser, campaign.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1 text-red-500" />
                            Revoke Access
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => selectedUser && handleAssignCampaign(selectedUser, campaign.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                            Grant Access
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setShowCampaignAccessDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
