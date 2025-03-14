
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaigns } from '@/contexts/CampaignContext';
import { Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignAccessProps {
  userId: string | null;
}

export const CampaignAccess: React.FC<CampaignAccessProps> = ({ userId }) => {
  const { users } = useAuth();
  const { campaigns, assignUserToCampaign, removeUserFromCampaign, getUserCampaigns } = useCampaigns();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId);
  const [userCampaigns, setUserCampaigns] = useState<string[]>([]);
  
  // Update selected user when prop changes
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);
  
  // Update user campaigns when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      const userCampaignsList = getUserCampaigns(selectedUserId).map(campaign => campaign.id);
      setUserCampaigns(userCampaignsList);
    } else {
      setUserCampaigns([]);
    }
  }, [selectedUserId, getUserCampaigns]);
  
  const handleAccessToggle = (campaignId: string) => {
    if (!selectedUserId) return;
    
    if (userCampaigns.includes(campaignId)) {
      removeUserFromCampaign(campaignId, selectedUserId);
      setUserCampaigns(prev => prev.filter(id => id !== campaignId));
    } else {
      assignUserToCampaign(campaignId, selectedUserId);
      setUserCampaigns(prev => [...prev, campaignId]);
    }
  };
  
  const campaignerUsers = users.filter(user => !user.isAdmin);
  
  return (
    <div className="space-y-4">
      {!selectedUserId && (
        <div className="mb-4">
          <Select 
            value={selectedUserId || ''} 
            onValueChange={(value) => setSelectedUserId(value)}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a user to manage access" />
            </SelectTrigger>
            <SelectContent>
              {campaignerUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedUserId ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.type}</TableCell>
                <TableCell>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs 
                    ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                      'bg-blue-100 text-blue-800'}`}
                  >
                    {campaign.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={userCampaigns.includes(campaign.id) ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleAccessToggle(campaign.id)}
                  >
                    {userCampaigns.includes(campaign.id) ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Revoke
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Grant
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Alert>
          <AlertDescription>
            Please select a user to manage their campaign access.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
