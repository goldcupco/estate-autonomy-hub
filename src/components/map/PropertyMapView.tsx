
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

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
  
  useEffect(() => {
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
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  // Create a dynamic Street View URL using the property's coordinates
  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyA9JZYwXcUnf7hSnFMvRCmwGLoOkWQ-JwY&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=90`;

  const handleStreetViewError = () => {
    console.error("Street view failed to load");
    setStreetViewError(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Location</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => {
            setStreetViewOpen(true);
            setStreetViewError(false); // Reset error state when opening
          }}
        >
          <Eye className="h-4 w-4" />
          <span>Street View</span>
        </Button>
      </div>
      
      <div style={{ height, width }} className="relative rounded-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
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
      </div>
      
      <p className="text-sm text-muted-foreground">{address}</p>

      {/* Street View Dialog */}
      <Dialog open={streetViewOpen} onOpenChange={setStreetViewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Street View - {address}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full min-h-[500px]">
            {streetViewError ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted rounded-md">
                <p className="text-muted-foreground mb-2">Street view is not available for this location</p>
                <Button 
                  variant="outline" 
                  onClick={() => setStreetViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            ) : (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={streetViewUrl}
                onError={handleStreetViewError}
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyMapView;
