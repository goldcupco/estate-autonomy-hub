
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Location</h3>
      </div>
      
      <div style={{ height, width }} className="relative rounded-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          whenReady={handleMapLoad}
        >
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
    </div>
  );
};

export default PropertyMapView;
