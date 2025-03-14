
import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api';

interface GoogleMapWithStreetViewProps {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  height?: string;
  width?: string;
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

export const GoogleMapWithStreetView: React.FC<GoogleMapWithStreetViewProps> = ({
  address,
  location,
  height = '400px',
  width = '100%',
  zoom = 17
}) => {
  const [showStreetView, setShowStreetView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Load the Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC5v9LF69t5YFrCdfvny_IrJVYLgkFj9Pc' // Fallback to a test key (will show development watermark)
  });

  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setIsLoading(false);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Location</h3>
        <button
          onClick={() => setShowStreetView(!showStreetView)}
          className="text-sm px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
        >
          {showStreetView ? 'Show Map' : 'Show Street View'}
        </button>
      </div>
      
      <div style={{ height, width }} className="relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={location}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: true,
              mapTypeControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            {!showStreetView && <Marker position={location} title={address} />}
            
            {showStreetView && (
              <StreetViewPanorama
                options={{
                  position: location,
                  visible: true,
                  enableCloseButton: false,
                  addressControl: true,
                  fullscreenControl: true,
                  panControl: true,
                  zoomControl: true,
                }}
              />
            )}
          </GoogleMap>
        )}
        
        {isLoading && isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">{address}</p>
    </div>
  );
};

export default GoogleMapWithStreetView;
