
import { DataUploader } from '@/components/ui/DataUploader';

interface CSVImporterProps {
  onImportSuccess?: (properties: any[]) => void;
}

export function CSVImporter({ onImportSuccess }: CSVImporterProps) {
  const handleCSVUpload = (data: any[]) => {
    if (onImportSuccess) {
      onImportSuccess(data);
    }
  };

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        If you have a CSV export from your MLS system, you can upload it here.
        Make sure it includes columns for address, city, state, zip, price, beds, baths, and square footage.
      </div>
      
      <DataUploader 
        title="Upload MLS CSV Data"
        description="Upload a CSV file exported from your MLS system"
        acceptedFileTypes=".csv"
        onUploadComplete={handleCSVUpload}
      />
    </>
  );
}
