
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, MapPin, User, Users } from 'lucide-react';

// Temporary token storage - in production, this should be handled through environment variables
const MAPBOX_TOKEN_KEY = 'mapbox_token';

interface MapSearchProps {
  data: any[];
  contactType: 'seller' | 'buyer';
  onSelect?: (contact: any) => void;
}

export const MapSearch = ({ data, contactType, onSelect }: MapSearchProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenInputVisible, setIsTokenInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  
  // Initialize map when token is available
  useEffect(() => {
    const storedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (storedToken) {
      setMapboxToken(storedToken);
    } else {
      setIsTokenInputVisible(true);
    }
  }, []);
  
  const saveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, mapboxToken);
      setIsTokenInputVisible(false);
    }
  };
  
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add markers for contact data
      if (data && data.length > 0) {
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
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsTokenInputVisible(true);
    }
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, data, contactType, onSelect]);
  
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

  if (isTokenInputVisible) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Mapbox Token Required</CardTitle>
          <CardDescription>
            Please enter your Mapbox public token to use the map feature.
            You can find or create your token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="pk.eyJ1Ijoie3lvdXItdX..."
              />
            </div>
            <Button onClick={saveToken} className="w-full">Save Token</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
      
      <div className="md:col-span-2 h-[calc(100vh-200px)] rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapSearch;
