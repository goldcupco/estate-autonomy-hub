
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleMapsApi } from '@/hooks/use-google-maps';

interface PropertyStreetViewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

const PropertyStreetView = ({ latitude, longitude, address }: PropertyStreetViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { isLoaded: mapsLoaded, loadError } = useGoogleMapsApi();
  const streetViewRef = useRef<HTMLDivElement>(null);
  
  // A unique ID for this Street View
  const streetViewId = `street-view-${Math.random().toString(36).substring(2, 11)}`;
  
  useEffect(() => {
    // Only run if we have coordinates and maps are loaded
    if (!latitude || !longitude || !mapsLoaded || loadError) {
      if (loadError) {
        setHasError(true);
        setIsLoading(false);
      }
      return;
    }
    
    let panorama: google.maps.StreetViewPanorama | null = null;
    let streetViewService: google.maps.StreetViewService | null = null;
    
    try {
      setIsLoading(true);
      
      // Get the street view div
      const streetViewDiv = document.getElementById(streetViewId);
      if (!streetViewDiv) return;
      
      // Create a StreetViewService to check for StreetView imagery
      streetViewService = new google.maps.StreetViewService();
      
      // Set up the panorama
      panorama = new google.maps.StreetViewPanorama(streetViewDiv, {
        position: { lat: latitude, lng: longitude },
        pov: { heading: 34, pitch: 10 },
        fullscreenControl: false,
        addressControl: true,
        motionTracking: false,
        motionTrackingControl: false
      });
      
      // Check if Street View imagery exists within 50 meters
      streetViewService.getPanorama({
        location: { lat: latitude, lng: longitude },
        radius: 50 // meters
      }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
          // Street View imagery exists
          panorama?.setPosition(data.location.latLng);
          setHasError(false);
        } else {
          // No Street View imagery found
          setHasError(true);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error initializing Street View:', error);
      setHasError(true);
      setIsLoading(false);
    }
    
    return () => {
      // Clean up
      panorama = null;
      streetViewService = null;
    };
  }, [latitude, longitude, mapsLoaded, loadError, streetViewId]);
  
  const reloadStreetView = () => {
    setIsLoading(true);
    setHasError(false);
    // Trigger a re-render to reload the street view
    if (streetViewRef.current) {
      streetViewRef.current.innerHTML = '';
    }
    const initEvent = new Event('load');
    window.dispatchEvent(initEvent);
  };
  
  if (loadError) {
    return (
      <Card className="h-[400px] relative overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center p-6">
            <Alert>
              <MapPin className="h-5 w-5 mr-2" />
              <AlertDescription>
                Google Maps API could not be loaded. Please check your API key.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (hasError) {
    return (
      <Card className="h-[400px] relative overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center p-6">
            <Alert>
              <MapPin className="h-5 w-5 mr-2" />
              <AlertDescription>
                Street View is not available for this location.
                {address && <div className="mt-2 text-sm opacity-70">{address}</div>}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={reloadStreetView} 
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
        <div 
          id={streetViewId} 
          ref={streetViewRef}
          className="w-full h-full"
          aria-label="Street View of property location"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-sm">Loading Street View...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyStreetView;
