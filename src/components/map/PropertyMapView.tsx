
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Map, Eye, AlertTriangle, Info } from 'lucide-react';
import { useGoogleMapsApi } from '@/hooks/use-google-maps';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// Fix for Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to set the map view
const MapViewController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(center, zoom);
    // Enable or disable scroll wheel zoom programmatically
    map.scrollWheelZoom.disable();
  }, [center, zoom, map]);
  
  return null;
};

interface PropertyMapViewProps {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  height?: string;
  width?: string;
  zoom?: number;
}

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  address,
  location,
  height = '400px',
  width = '100%',
  zoom = 17
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [streetViewError, setStreetViewError] = useState(false);
  const [mapView, setMapView] = useState(true); // Controls whether map or street view is shown
  const { isLoaded: googleMapsLoaded, loadError, apiKey } = useGoogleMapsApi();

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  // Create a dynamic Street View URL using the property's coordinates
  const streetViewUrl = apiKey ? 
    `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=90` :
    '';

  const handleStreetViewError = () => {
    console.error("Street view failed to load");
    setStreetViewError(true);
    toast.error("Street View imagery could not be loaded");
    // Automatically switch back to map view
    setMapView(true);
  };

  // If we want to show street view but don't have a Google Maps API key or it failed to load
  const showStreetViewError = !mapView && (!apiKey || loadError);

  // If there's an API key error and we're trying to view street view, force map view
  React.useEffect(() => {
    if (showStreetViewError) {
      setMapView(true);
      if (!apiKey) {
        toast.error("Missing Google Maps API key", {
          description: "Street View requires a valid API key"
        });
      } else if (loadError) {
        toast.error("Invalid Google Maps API key", {
          description: "Please check your API key configuration"
        });
      }
    }
  }, [showStreetViewError, apiKey, loadError]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Location</h3>
        <div className="flex gap-2">
          <Button 
            variant={mapView ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setMapView(true)}
          >
            <Map className="h-4 w-4" />
            <span>Map</span>
          </Button>
          <Button 
            variant={!mapView ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              if (loadError) {
                // Don't allow switching to street view if API key is invalid
                toast.error("Street View unavailable", {
                  description: "Google Maps API key is missing or invalid"
                });
                return;
              }
              setMapView(false);
              setStreetViewError(false); // Reset error state when switching
            }}
            disabled={!!loadError}
            title={loadError ? "Street View unavailable due to API key issues" : ""}
          >
            <Eye className="h-4 w-4" />
            <span>Street View</span>
          </Button>
        </div>
      </div>
      
      {loadError && (
        <Alert className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Street View is unavailable: {!apiKey ? 
              "Google Maps API key is missing" : 
              "Google Maps API key is invalid"}.
          </AlertDescription>
        </Alert>
      )}
      
      <div style={{ height, width }} className="relative rounded-md overflow-hidden">
        {isLoading && mapView && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {mapView ? (
          <MapContainer 
            style={{ height: '100%', width: '100%' }}
            whenReady={handleMapLoad}
          >
            <MapViewController center={[location.lat, location.lng]} zoom={zoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AttributionControl
              position="bottomright"
              prefix={false}
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                {address}
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          showStreetViewError || streetViewError ? (
            <div className="flex flex-col items-center justify-center h-full bg-muted rounded-md">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-muted-foreground mb-2">
                {showStreetViewError ? 
                  "Google Maps API key is missing or invalid" : 
                  "Street view is not available for this location"}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setMapView(true)}
              >
                Show Map Instead
              </Button>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={streetViewUrl}
              onError={handleStreetViewError}
            ></iframe>
          )
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">{address}</p>
    </div>
  );
};

export default PropertyMapView;
