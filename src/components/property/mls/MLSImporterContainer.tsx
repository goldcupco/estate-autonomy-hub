
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MLSApiImporter } from './MLSApiImporter';
import { CSVImporter } from './CSVImporter';

interface MLSImporterProps {
  onImportSuccess?: (properties: any[]) => void;
}

export function MLSImporterContainer({ onImportSuccess }: MLSImporterProps) {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api">MLS API</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4 mt-4">
          <MLSApiImporter onImportSuccess={onImportSuccess} />
        </TabsContent>
        
        <TabsContent value="csv" className="space-y-4 mt-4">
          <CSVImporter onImportSuccess={onImportSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
