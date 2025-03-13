
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataUploader } from '@/components/ui/DataUploader';
import { ClipboardList, Download, Upload, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function Lists() {
  const { toast } = useToast();
  const [sellerData, setSellerData] = useState<any[] | null>(null);
  const [buyerData, setBuyerData] = useState<any[] | null>(null);

  const handleSellerUploadComplete = (data: any[]) => {
    setSellerData(data);
    toast({
      title: "Seller List Uploaded",
      description: `Successfully imported ${data.length} seller records.`,
    });
  };

  const handleBuyerUploadComplete = (data: any[]) => {
    setBuyerData(data);
    toast({
      title: "Buyer List Uploaded",
      description: `Successfully imported ${data.length} buyer records.`,
    });
  };

  // Dummy lists data
  const listsSummary = [
    {
      title: "All Sellers",
      description: "Complete list of property sellers",
      count: 342,
      lastUpdated: "2023-06-12",
      type: "seller"
    },
    {
      title: "All Buyers",
      description: "Complete list of property buyers",
      count: 278,
      lastUpdated: "2023-06-10",
      type: "buyer"
    },
    {
      title: "High Value Sellers",
      description: "Sellers with properties > $500k",
      count: 124,
      lastUpdated: "2023-06-08",
      type: "seller"
    },
    {
      title: "Cash Buyers",
      description: "Buyers ready to purchase with cash",
      count: 86,
      lastUpdated: "2023-06-05",
      type: "buyer"
    },
    {
      title: "Motivated Sellers",
      description: "Sellers needing to move quickly",
      count: 53,
      lastUpdated: "2023-06-07",
      type: "seller"
    },
    {
      title: "First-Time Buyers",
      description: "Buyers looking for their first home",
      count: 112,
      lastUpdated: "2023-06-09",
      type: "buyer"
    },
  ];

  // Filter lists by type
  const filterListsByType = (type: string) => {
    if (type === 'all') return listsSummary;
    return listsSummary.filter(list => list.type === type);
  };

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Lists</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 animate-scale-in animate-delay-100">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="flex items-center gap-2 animate-scale-in">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full animate-scale-in">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Lists</TabsTrigger>
          <TabsTrigger value="seller">Seller Lists</TabsTrigger>
          <TabsTrigger value="buyer">Buyer Lists</TabsTrigger>
          <TabsTrigger value="upload">Upload New List</TabsTrigger>
        </TabsList>
        
        {/* All Lists Tab */}
        <TabsContent value="all" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterListsByType('all').map((list, index) => (
              <Card key={index} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <CardTitle>{list.title}</CardTitle>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{list.count}</div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {list.lastUpdated}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Seller Lists Tab */}
        <TabsContent value="seller" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterListsByType('seller').map((list, index) => (
              <Card key={index} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <CardTitle>{list.title}</CardTitle>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{list.count}</div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {list.lastUpdated}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Buyer Lists Tab */}
        <TabsContent value="buyer" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterListsByType('buyer').map((list, index) => (
              <Card key={index} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <CardTitle>{list.title}</CardTitle>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{list.count}</div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {list.lastUpdated}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Upload New List Tab */}
        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Upload Seller List
                </CardTitle>
                <CardDescription>
                  Import a CSV file containing seller information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Seller Data"
                  description="CSV file should include name, contact, property details"
                  onUploadComplete={handleSellerUploadComplete}
                />
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  For best results, include columns for name, address, phone, email and property details.
                </p>
              </CardFooter>
            </Card>
            
            <Card className="glass-card animate-scale-in animate-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Upload Buyer List
                </CardTitle>
                <CardDescription>
                  Import a CSV file containing buyer information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Buyer Data"
                  description="CSV file should include name, contact, preferences"
                  onUploadComplete={handleBuyerUploadComplete}
                />
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  For best results, include columns for name, contact information, budget, and property preferences.
                </p>
              </CardFooter>
            </Card>
          </div>
          
          {/* Preview of Uploaded Data */}
          {(sellerData || buyerData) && (
            <Card className="mt-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Uploaded Data Preview</CardTitle>
                <CardDescription>
                  {sellerData ? `${sellerData.length} seller records` : ''} 
                  {sellerData && buyerData ? ' and ' : ''}
                  {buyerData ? `${buyerData.length} buyer records` : ''} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {sellerData && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Seller Data:</h3>
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                        {JSON.stringify(sellerData.slice(0, 5), null, 2)}
                        {sellerData.length > 5 && <div className="text-center mt-2">... and {sellerData.length - 5} more records</div>}
                      </pre>
                    </div>
                  )}
                  
                  {buyerData && (
                    <div>
                      <h3 className="font-medium mb-2">Buyer Data:</h3>
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                        {JSON.stringify(buyerData.slice(0, 5), null, 2)}
                        {buyerData.length > 5 && <div className="text-center mt-2">... and {buyerData.length - 5} more records</div>}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save to Database</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Lists;
