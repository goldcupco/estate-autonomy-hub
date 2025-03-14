
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, ExternalLink, Map, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PropertyStreetViewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

type MapProvider = 'openstreetmap' | 'geoapify' | 'maptiler';

const PropertyStreetView = ({ latitude, longitude, address }: PropertyStreetViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mapProvider, setMapProvider] = useState<MapProvider>('openstreetmap');
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Primary map provider: OpenStreetMap static map URL
  const zoom = 18;
  const mapWidth = 800;
  const mapHeight = 400;
  const staticMapUrl = `https://static-maps.openstreetmap.fr/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${mapWidth}x${mapHeight}&markers=${latitude},${longitude}&format=png`;
  
  // Backup map provider 1: Geoapify
  const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${mapWidth}&height=${mapHeight}&center=lonlat:${longitude},${latitude}&zoom=${zoom}&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:medium&format=png`;
  
  // Backup map provider 2: MapTiler (free tier, no API key required for basic usage)
  const maptilerUrl = `https://api.maptiler.com/maps/streets/static/${longitude},${latitude},${zoom}/${mapWidth}x${mapHeight}.png?key=get_your_own_D6rA4zTHduk6KOKTXzGB`;

  // Direct link to view the location on OpenStreetMap
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`;

  // Get the current map URL based on provider
  const getCurrentMapUrl = () => {
    switch (mapProvider) {
      case 'openstreetmap':
        return `${staticMapUrl}&_t=${Date.now()}`;
      case 'geoapify':
        return `${geoapifyUrl}&_t=${Date.now()}`;
      case 'maptiler':
        return `${maptilerUrl}&_t=${Date.now()}`;
      default:
        return staticMapUrl;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    // If we successfully loaded a fallback provider, show a toast
    if (mapProvider !== 'openstreetmap') {
      toast.info(`Using ${mapProvider} as fallback map provider`);
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load map from ${mapProvider}`);
    
    // Try next provider
    if (mapProvider === 'openstreetmap') {
      console.log('OpenStreetMap failed, trying Geoapify...');
      setMapProvider('geoapify');
      setIsLoading(true);
    } else if (mapProvider === 'geoapify') {
      console.log('Geoapify failed, trying MapTiler...');
      setMapProvider('maptiler');
      setIsLoading(true);
    } else {
      // All providers failed
      setIsLoading(false);
      setHasError(true);
      console.error('Failed to load map image from all providers');
      toast.error("Failed to load map image", {
        description: "All map providers failed"
      });
    }
  };

  // Force reload the image
  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.src = getCurrentMapUrl();
    }
  }, [mapProvider, retryCount]);

  const reloadStaticMap = () => {
    // Reset to primary provider
    setMapProvider('openstreetmap');
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
    toast.info("Retrying map load...");
  };
  
  if (hasError) {
    return (
      <Card className="h-[400px] relative overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center p-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Map Loading Error</AlertTitle>
              <AlertDescription>
                We couldn't load a map image for this location from any provider.
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
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-sm">Loading map image...</span>
              </div>
            </div>
          )}
          
          <img 
            ref={imgRef}
            id="static-map-img"
            src={getCurrentMapUrl()}
            alt={`Map view of ${address || 'property location'}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="absolute bottom-2 right-2 flex gap-2 z-20">
            {mapProvider !== 'openstreetmap' && (
              <span className="text-xs bg-background/80 px-2 py-1 rounded">
                Using {mapProvider} fallback
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

