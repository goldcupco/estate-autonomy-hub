
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, User, Lock, Bell, ArrowLeft, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, isAdmin, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">
                    <BreadcrumbLink>Home</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/dashboard">
                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
          
          {currentUser && (
            <div className="mb-8 p-6 glass-card rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                  <p className="text-muted-foreground">{currentUser.email}</p>
                  <div className="mt-1">
                    <Badge variant={isAdmin ? "default" : "outline"}>
                      {isAdmin ? "Administrator" : "Campaigner"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Profile Settings Card */}
            <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Profile</h2>
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Manage your personal information and preferences.
              </p>
              <Button className="w-full">Edit Profile</Button>
            </div>
            
            {/* Security Settings Card */}
            <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Security</h2>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-full">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Update your password and security settings.
              </p>
              <Button className="w-full">Security Settings</Button>
            </div>
            
            {/* Notifications Settings Card */}
            <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                  <Bell className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Control your email and push notification preferences.
              </p>
              <Button className="w-full">Notification Settings</Button>
            </div>
          </div>
          
          {isAdmin && (
            <div className="glass-card rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Administrator Settings
              </h2>
              <p className="text-muted-foreground mb-4">
                Manage users, permissions, and system settings.
              </p>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User Management
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add, remove, and manage permissions for users of the system.
                  </p>
                  <Link to="/user-management">
                    <Button>Manage Users</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <p className="text-muted-foreground mb-4">
              Configure your system preferences and application settings.
            </p>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Additional settings functionality will be implemented soon.</p>
              <Link to="/dashboard" className="mt-4 inline-block">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
