
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user roles
export type UserRole = 'administrator' | 'campaigner';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campaigns: string[]; // IDs of campaigns this user has access to
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
  assignCampaignToUser: (userId: string, campaignId: string) => void;
  removeCampaignFromUser: (userId: string, campaignId: string) => void;
  userHasAccessToCampaign: (campaignId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'administrator',
    campaigns: []
  },
  {
    id: '2',
    name: 'Campaign Manager 1',
    email: 'campaign1@example.com',
    role: 'campaigner',
    campaigns: ['1', '2']
  },
  {
    id: '3',
    name: 'Campaign Manager 2',
    email: 'campaign2@example.com',
    role: 'campaigner',
    campaigns: ['3', '4']
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    // In a real app, this would validate against a backend
    // For demo purposes, we'll just look up the user by email
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      throw new Error('Invalid credentials');
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: String(users.length + 1) };
    setUsers([...users, newUser]);
  };
  
  const updateUser = (id: string, updates: Partial<Omit<User, 'id'>>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
    
    // Update current user if needed
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };
  
  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };
  
  const assignCampaignToUser = (userId: string, campaignId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId && !user.campaigns.includes(campaignId)) {
        return { ...user, campaigns: [...user.campaigns, campaignId] };
      }
      return user;
    }));
  };
  
  const removeCampaignFromUser = (userId: string, campaignId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, campaigns: user.campaigns.filter(id => id !== campaignId) };
      }
      return user;
    }));
  };
  
  const userHasAccessToCampaign = (campaignId: string) => {
    if (!currentUser) return false;
    
    // Admins have access to all campaigns
    if (currentUser.role === 'administrator') return true;
    
    // Campaigners only have access to assigned campaigns
    return currentUser.campaigns.includes(campaignId);
  };
  
  const isAdmin = currentUser?.role === 'administrator';
  const isAuthenticated = !!currentUser;
  
  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        users, 
        isAuthenticated, 
        isAdmin,
        login, 
        logout, 
        addUser, 
        updateUser, 
        deleteUser,
        assignCampaignToUser,
        removeCampaignFromUser,
        userHasAccessToCampaign
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
