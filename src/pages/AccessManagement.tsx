
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { UserTable } from '@/components/users/UserTable';
import { CampaignAccess } from '@/components/campaigns/CampaignAccess';
import { useAuth, UserRole } from '@/contexts/AuthContext';
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
  const [editUser, setEditUser] = useState<string | null>(null);
  
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
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
                <UserTable onSelectUser={setSelectedUserId} onEditUser={handleEditUser} />
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
      </div>
    </Layout>
  );
};

export default AccessManagement;
