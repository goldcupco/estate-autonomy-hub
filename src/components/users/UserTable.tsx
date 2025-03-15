
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditIcon, Trash2Icon, KeyRound } from 'lucide-react';

interface UserTableProps {
  onSelectUser: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ onSelectUser }) => {
  const { users, deleteUser } = useAuth();
  
  // Filter out the admin from the displayed users list
  const displayUsers = users;
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'administrator' ? "destructive" : "secondary"}>
                {user.role === 'administrator' ? "Administrator" : "Campaigner"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                Active
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onSelectUser(user.id)}
              >
                <EditIcon className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              
              {user.role !== 'administrator' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onSelectUser(user.id)}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span className="sr-only">Manage Access</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => deleteUser && deleteUser(user.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
