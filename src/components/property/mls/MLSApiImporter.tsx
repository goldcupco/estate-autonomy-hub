
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MLS_PROVIDERS } from './mlsConstants';
import { simulateMLSApiImport } from './mlsUtils';
import { Progress } from '@/components/ui/progress';

interface MLSApiImporterProps {
  onImportSuccess?: (properties: any[]) => void;
}

export function MLSApiImporter({ onImportSuccess }: MLSApiImporterProps) {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartImport = async () => {
    if (!selectedProvider) return;
    
    setIsImporting(true);
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15) + 5;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);
    
    try {
      // Call the MLS API import function
      const importedProperties = await simulateMLSApiImport(selectedProvider);
      
      // Set progress to 100% when complete
      clearInterval(progressInterval);
      setProgress(100);
      
      // Call the success callback
      if (onImportSuccess) {
        onImportSuccess(importedProperties);
      }
    } catch (error) {
      console.error('Error importing from MLS:', error);
      clearInterval(progressInterval);
    } finally {
      // Reset after a short delay to show 100% progress
      setTimeout(() => {
        setIsImporting(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        Connect to your MLS system to import property listings directly into your database.
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select MLS Provider</label>
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                disabled={isImporting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an MLS provider" />
                </SelectTrigger>
                <SelectContent>
                  {MLS_PROVIDERS.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Importing properties: {progress}%
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleStartImport} 
              disabled={!selectedProvider || isImporting}
              className="w-full"
            >
              {isImporting ? 'Importing...' : 'Start Import'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
