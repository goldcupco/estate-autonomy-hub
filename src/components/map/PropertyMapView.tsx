
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

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  // Create the encoded Google Street View URL
  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBtv9-R3NrzS4C9d2UjinkkQBmjlNtCKg4&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=90`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Location</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setStreetViewOpen(true)}
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
          center={[0, 0]} // Default center, will be updated by MapViewController
          zoom={1} // Default zoom, will be updated by MapViewController
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
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={streetViewUrl}
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyMapView;
