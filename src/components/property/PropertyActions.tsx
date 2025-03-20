
import { Button } from '@/components/ui/button';
import { Building, Database, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MLSImporter } from '@/components/property/mls';
import { toast } from 'sonner';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { fetchProperties } from '@/services/propertyService';

export function PropertyActions() {
  const { setProperties, setIsLoading, setEditingProperty, setAddPropertyOpen } = usePropertyContext();

  const refreshProperties = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching properties from database...");
      const properties = await fetchProperties();
      console.log("Properties fetched:", properties);
      setProperties(properties);
      toast.success("Properties refreshed successfully");
    } catch (error) {
      console.error("Error refreshing properties:", error);
      toast.error("Failed to refresh properties");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 animate-scale-in">
            <Database className="h-4 w-4" />
            <span>Import MLS Data</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Import MLS Data</SheetTitle>
            <SheetDescription>
              Connect to an MLS system or upload a CSV file to import property listings.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <MLSImporter onImportSuccess={(props) => {
              refreshProperties();
              toast.success(`Successfully imported ${props.length} properties from MLS`);
            }} />
          </div>
        </SheetContent>
      </Sheet>
      
      <Button 
        className="flex items-center gap-2 animate-scale-in" 
        onClick={() => {
          setEditingProperty(null);
          setAddPropertyOpen(true);
        }}
      >
        <Building className="h-4 w-4" />
        <span>Add Property</span>
      </Button>

      <Button 
        variant="outline"
        className="flex items-center gap-2 animate-scale-in ml-auto" 
        onClick={refreshProperties}
      >
        <RefreshCw className="h-4 w-4" />
        <span>Refresh</span>
      </Button>
    </div>
  );
}
