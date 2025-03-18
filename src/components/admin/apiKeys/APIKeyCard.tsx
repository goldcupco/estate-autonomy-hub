
import { useState } from 'react';
import { Trash, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { DbCommunicationProvider } from '@/utils/supabaseClient';

interface APIKeyCardProps {
  apiKey: DbCommunicationProvider;
  onDelete: (id: string) => Promise<void>;
}

export const APIKeyCard = ({ apiKey, onDelete }: APIKeyCardProps) => {
  const [showSecret, setShowSecret] = useState(false);

  // Toggle visibility of a secret
  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-base">
          <span>{apiKey.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onDelete(apiKey.id)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </CardTitle>
        <CardDescription>{apiKey.type === 'twilio' ? 'Twilio' : 'CallRail'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {apiKey.type === 'twilio' ? (
          <>
            <div className="flex justify-between items-center">
              <span className="font-medium">Account SID:</span>
              <span className="font-mono text-gray-500">{apiKey.config.accountSid?.substring(0, 4)}...{apiKey.config.accountSid?.substring(apiKey.config.accountSid.length - 4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Auth Token:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-gray-500">
                  {showSecret ? apiKey.config.authToken : '••••••••'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={toggleSecretVisibility}
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Phone Number:</span>
              <span className="font-mono text-gray-500">{apiKey.config.twilioNumber}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="font-medium">API Key:</span>
              <span className="font-mono text-gray-500">{apiKey.config.apiKey?.substring(0, 4)}...{apiKey.config.apiKey?.substring(apiKey.config.apiKey.length - 4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Account ID:</span>
              <span className="font-mono text-gray-500">{apiKey.config.accountId}</span>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-1 text-xs text-gray-500">
        <AlertCircle className="h-3.5 w-3.5 mr-1" /> Stored securely in Supabase
      </CardFooter>
    </Card>
  );
};
