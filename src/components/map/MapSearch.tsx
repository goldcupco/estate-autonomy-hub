
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, MapPin, User, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Public Mapbox token for demo purposes
// In production, use your own token from your Mapbox account
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface MapSearchProps {
  data: any[];
  contactType: 'seller' | 'buyer';
  onSelect?: (contact: any) => void;
}

export const MapSearch = ({ data, contactType, onSelect }: MapSearchProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add error handling for map loading
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Error loading map. Please check your internet connection or try again later.');
      });
      
      // When the map style is loaded
      map.current.on('style.load', () => {
        setMapLoaded(true);
      });
      
      // Add markers for contact data
      map.current.on('load', () => {
        setMapLoaded(true);
        if (data && data.length > 0 && map.current) {
          data.forEach(contact => {
            if (contact.location?.lat && contact.location?.lng) {
              const markerColor = contactType === 'seller' ? '#ef4444' : '#3b82f6';
              
              const el = document.createElement('div');
              el.className = 'marker';
              el.style.backgroundColor = markerColor;
              el.style.width = '20px';
              el.style.height = '20px';
              el.style.borderRadius = '50%';
              el.style.cursor = 'pointer';
              el.style.border = '2px solid white';
              el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
              
              const marker = new mapboxgl.Marker(el)
                .setLngLat([contact.location.lng, contact.location.lat])
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                      <strong>${contact.name}</strong><br>
                      ${contact.address || ''}<br>
                      ${contact.email || ''}<br>
                      ${contact.phone || ''}
                    `)
                )
                .addTo(map.current);
                
              el.addEventListener('click', () => {
                setSelectedContact(contact);
                if (onSelect) onSelect(contact);
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map. Please check your internet connection or try again later.');
    }
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [data, contactType, onSelect]);
  
  // Filter contacts based on search
  const filteredContacts = data.filter(contact => 
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery)
  );
  
  // Center map on contact
  const centerMapOnContact = (contact: any) => {
    if (map.current && contact.location?.lat && contact.location?.lng) {
      map.current.flyTo({
        center: [contact.location.lng, contact.location.lat],
        zoom: 14,
        essential: true
      });
      setSelectedContact(contact);
      if (onSelect) onSelect(contact);
    }
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
                  onClick={() => centerMapOnContact(contact)}
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
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 p-4">
            <Alert variant="destructive" className="w-full max-w-md">
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>
                <p>{mapError}</p>
                <Button 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapSearch;
