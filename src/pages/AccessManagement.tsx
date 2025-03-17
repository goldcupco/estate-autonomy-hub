
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { UserTable } from '@/components/users/UserTable';
import { CampaignAccess } from '@/components/campaigns/CampaignAccess';
import { useAuth, UserRole, User } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const AccessManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'campaigner' as UserRole,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const { isAdmin, addUser, updateUser, users } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

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
    
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User added successfully"
    });
  };
  
  const handleUpdateUser = () => {
    if (!editUser) return;
    
    updateUser(editUser, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    setEditUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'campaigner'
    });
    
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User updated successfully"
    });
  };
  
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setEditUser(userId);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsDialogOpen(true);
  };
  
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };
  
  const closeViewDialog = () => {
    setViewingUser(null);
    setIsViewDialogOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Manage Access</h1>
          </div>
          
          <Button onClick={() => {
            setEditUser(null);
            setNewUser({
              name: '',
              email: '',
              role: 'campaigner'
            });
            setIsDialogOpen(true);
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their roles. Add, remove, or edit user accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserTable 
                  onSelectUser={setSelectedUserId} 
                  onEditUser={handleEditUser}
                  onViewUser={handleViewUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Access Control</CardTitle>
                <CardDescription>
                  Control which users have access to which campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignAccess userId={selectedUserId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Dialog for adding/editing users */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editUser ? 'Update user information' : 'Fill in the details to create a new user'}
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
              {editUser ? (
                <Button onClick={handleUpdateUser}>Update User</Button>
              ) : (
                <Button onClick={handleAddUser}>Add User</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog for viewing user details */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about this user
              </DialogDescription>
            </DialogHeader>
            
            {viewingUser && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{viewingUser.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{viewingUser.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge variant={viewingUser.role === 'administrator' ? "destructive" : "secondary"}>
                      {viewingUser.role === 'administrator' ? "Administrator" : "Campaigner"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Campaigns Access</p>
                  {viewingUser.campaigns.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewingUser.campaigns.map(campaignId => (
                        <Badge key={campaignId} variant="outline">Campaign {campaignId}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No campaign access assigned</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <Badge variant="outline" className="capitalize">Active</Badge>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={closeViewDialog}>Close</Button>
              <Button onClick={() => {
                closeViewDialog();
                if (viewingUser) {
                  handleEditUser(viewingUser.id);
                }
              }}>Edit User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AccessManagement;
