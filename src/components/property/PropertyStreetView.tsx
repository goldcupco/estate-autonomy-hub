
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PropertyStreetViewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

const PropertyStreetView = ({ latitude, longitude, address }: PropertyStreetViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Generate OpenStreetMap static map URL
  const zoom = 18;
  const mapWidth = 800;
  const mapHeight = 400;
  const staticMapUrl = `https://static-maps.openstreetmap.fr/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${mapWidth}x${mapHeight}&markers=${latitude},${longitude}&format=png`;
  
  // Direct link to view the location on OpenStreetMap
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Failed to load the map image');
  };

  const reloadStaticMap = () => {
    setIsLoading(true);
    setHasError(false);
    // Force reload by appending a timestamp
    const imgElement = document.getElementById('static-map-img') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = `${staticMapUrl}&_t=${Date.now()}`;
    }
  };
  
  if (hasError) {
    return (
      <Card className="h-[400px] relative overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center p-6">
            <Alert>
              <MapPin className="h-5 w-5 mr-2" />
              <AlertDescription>
                Static map image could not be loaded for this location.
                {address && <div className="mt-2 text-sm opacity-70">{address}</div>}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={reloadStaticMap} 
              className="mt-4" 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-[400px] relative overflow-hidden">
      <CardContent className="p-0 h-full">
        <div className="w-full h-full relative">
          <img 
            id="static-map-img"
            src={staticMapUrl}
            alt={`Map view of ${address || 'property location'}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-sm">Loading map image...</span>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 right-2">
            <a 
              href={osmUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-background/80 hover:bg-background px-2 py-1 rounded flex items-center gap-1"
            >
              View on OpenStreetMap
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyStreetView;
