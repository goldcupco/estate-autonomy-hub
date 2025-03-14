
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, ExternalLink, Map } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PropertyStreetViewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

const PropertyStreetView = ({ latitude, longitude, address }: PropertyStreetViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mapProvider, setMapProvider] = useState<'openstreetmap' | 'geoapify'>('openstreetmap');
  
  // Primary map provider: OpenStreetMap static map URL
  const zoom = 18;
  const mapWidth = 800;
  const mapHeight = 400;
  const staticMapUrl = `https://static-maps.openstreetmap.fr/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${mapWidth}x${mapHeight}&markers=${latitude},${longitude}&format=png`;
  
  // Backup map provider: Geoapify
  const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${mapWidth}&height=${mapHeight}&center=lonlat:${longitude},${latitude}&zoom=${zoom}&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:medium&format=png`;
  
  // Direct link to view the location on OpenStreetMap
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`;

  // Use the current map provider's URL
  const currentMapUrl = mapProvider === 'openstreetmap' ? staticMapUrl : geoapifyUrl;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    if (mapProvider === 'openstreetmap') {
      // If OpenStreetMap fails, try Geoapify
      console.log('OpenStreetMap failed, trying Geoapify...');
      setMapProvider('geoapify');
      setIsLoading(true);
    } else {
      // If both providers fail, show error
      setIsLoading(false);
      setHasError(true);
      console.error('Failed to load the map image from both providers');
    }
  };

  const reloadStaticMap = () => {
    // Reset to primary provider first
    setMapProvider('openstreetmap');
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
            <Alert variant="destructive">
              <MapPin className="h-5 w-5" />
              <AlertTitle>Map Loading Error</AlertTitle>
              <AlertDescription>
                We couldn't load a street view or map image for this location.
                {address && <div className="mt-2 text-sm opacity-70">{address}</div>}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex flex-col md:flex-row gap-2 justify-center">
              <Button 
                onClick={reloadStaticMap} 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                asChild
              >
                <a 
                  href={osmUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Map className="h-4 w-4 mr-2" />
                  View on OpenStreetMap
                </a>
              </Button>
            </div>
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
            src={currentMapUrl}
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
          
          <div className="absolute bottom-2 right-2 flex gap-2">
            {mapProvider === 'geoapify' && (
              <span className="text-xs bg-background/80 px-2 py-1 rounded">
                Using fallback map
              </span>
            )}
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
