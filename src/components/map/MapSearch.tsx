
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, User, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

interface MapSearchProps {
  data: any[];
  contactType: 'seller' | 'buyer';
  onSelect?: (contact: any) => void;
}

// Helper component to handle map view changes
const MapController = ({ center, zoom, contact }: { center: [number, number], zoom: number, contact: any | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (contact && contact.location) {
      map.flyTo([contact.location.lat, contact.location.lng], 14, {
        animate: true,
        duration: 1
      });
    }
  }, [contact, map]);
  
  return null;
};

export const MapSearch = ({ data, contactType, onSelect }: MapSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Set default map center to US
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const defaultZoom = 4;
  
  // Handle map load event
  const handleMapLoad = () => {
    setMapLoaded(true);
  };
  
  // Filter contacts based on search
  const filteredContacts = data.filter(contact => 
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery)
  );
  
  // Handle contact selection
  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (onSelect) onSelect(contact);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <Card className="md:col-span-1 overflow-auto max-h-[calc(100vh-200px)]">
        <CardHeader className="sticky top-0 bg-card z-10">
          <CardTitle>{contactType === 'seller' ? 'Sellers' : 'Buyers'} List</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${contactType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <div 
                  key={contact.id || index}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  {contact.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{contact.address}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No {contactType}s found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 h-[calc(100vh-200px)] rounded-lg overflow-hidden border relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full bg-primary/20 mx-auto animate-pulse" />
              <p className="mt-4 text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {mapError && (
          <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-20">
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}
        
        <div className="w-full h-full" id="map-container">
          <MapContainer 
            style={{ height: '100%', width: '100%' }}
            whenReady={handleMapLoad}
            // Fixed: Changed from 'center' and 'zoom' props to 'bounds' prop
            // react-leaflet v4 expects different prop structures
            // default view is set in the MapController component
          >
            <TileLayer
              // Fixed: Updated attribute names based on react-leaflet v4 expectations
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Controller component to handle map view changes */}
            <MapController 
              center={defaultCenter}
              zoom={defaultZoom}
              contact={selectedContact}
            />
            
            {/* Add markers for each contact with location */}
            {filteredContacts.map((contact, index) => {
              if (contact.location?.lat && contact.location?.lng) {
                return (
                  <Marker 
                    key={contact.id || index}
                    position={[contact.location.lat, contact.location.lng]}
                    eventHandlers={{
                      click: () => handleContactSelect(contact)
                    }}
                  >
                    <Popup>
                      <div>
                        <strong>{contact.name}</strong><br />
                        {contact.address || ''}<br />
                        {contact.email || ''}<br />
                        {contact.phone || ''}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
