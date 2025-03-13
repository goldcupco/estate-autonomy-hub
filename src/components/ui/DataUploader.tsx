
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';

interface DataUploaderProps {
  onUploadComplete?: (data: any[]) => void;
  title?: string;
  description?: string;
  acceptedFileTypes?: string;
}

export const DataUploader = ({
  onUploadComplete,
  title = "Upload Data",
  description = "Drag and drop your CSV file, or click to browse",
  acceptedFileTypes = ".csv"
}: DataUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  // Process the file
  const handleFile = (file: File) => {
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };

  // Trigger file browser
  const openFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload the file
  const uploadFile = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Simulate processing of the file
        setTimeout(() => {
          setIsUploading(false);
          
          // Parse CSV (simplified for demo)
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsedData = parseCSV(text);
            
            if (onUploadComplete) {
              onUploadComplete(parsedData);
            }
            
            toast({
              title: "Upload Complete",
              description: `Successfully processed ${parsedData.length} records from ${file.name}`,
            });
          };
          reader.readAsText(file);
        }, 500);
      }
      setProgress(currentProgress);
    }, 200);
  };

  // Simple CSV parser (for demo purposes)
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const entry: Record<string, string> = {};
      
      headers.forEach((header, i) => {
        entry[header.trim()] = values[i]?.trim() || '';
      });
      
      return entry;
    });
  };

  return (
    <div className="w-full animate-fade-in">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : file 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/10' 
              : 'border-border bg-background hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={file ? undefined : openFileBrowser}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  <FileIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                disabled={isUploading}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading: {progress}%
                </p>
              </div>
            )}
            
            {!isUploading && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  uploadFile();
                }}
                className="w-full"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <UploadIcon className="h-8 w-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-medium text-base">{title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {description}
              </p>
            </div>
            <Button variant="outline" className="mt-2">
              Select File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUploader;
