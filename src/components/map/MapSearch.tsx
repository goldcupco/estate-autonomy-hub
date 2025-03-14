
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, MapPin, User, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LOCAL_STORAGE_TOKEN_KEY = 'mapbox_access_token';

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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // State for the token dialog
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || '';
  });
  const [showTokenDialog, setShowTokenDialog] = useState<boolean>(!mapboxToken);
  const [tokenInput, setTokenInput] = useState<string>(mapboxToken);

  // Initialize map when component mounts and token is available
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;
    
    try {
      console.log('Initializing map with token');
      
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      // Create map instance with a simpler style that's more likely to work
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Using light style as it's generally more reliable
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3,
        maxZoom: 15,
        minZoom: 2,
        attributionControl: false // We'll add custom attribution
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add error handling for map loading
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        const errorMessage = e.error?.message || 'Unknown map error';
        setMapError(`Error loading map: ${errorMessage}`);
        
        // If the error contains token-related issues, show the token dialog
        if (errorMessage.toLowerCase().includes('token')) {
          setShowTokenDialog(true);
        }
      });
      
      // When the map is loaded
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('Map loaded successfully');
        addMarkers();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMapError(`Error initializing map: ${errorMessage}`);
      
      // If the error contains token-related issues, show the token dialog
      if (errorMessage.toLowerCase().includes('token')) {
        setShowTokenDialog(true);
      }
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      clearMarkers();
    };
  }, [mapboxToken]); // Re-initialize map when token changes

  // Save token and initialize map
  const handleSaveToken = () => {
    if (tokenInput && tokenInput.trim() !== '') {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenInput);
      setMapboxToken(tokenInput);
      setShowTokenDialog(false);
      setMapError(null);
      
      // If map was already initialized, remove it so we can recreate with new token
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  };

  // Function to clear markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Function to add markers
  const addMarkers = () => {
    if (!map.current || !map.current.loaded()) {
      console.log('Map not loaded yet, skipping markers');
      return;
    }
    
    console.log('Adding markers for', data.length, 'contacts');
    
    // Clear any existing markers
    clearMarkers();
    
    // Create and add markers for each contact
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
        
        markersRef.current.push(marker);
          
        el.addEventListener('click', () => {
          setSelectedContact(contact);
          if (onSelect) onSelect(contact);
        });
      }
    });
  };

  // Update markers when data changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      addMarkers();
    }
  }, [data, mapLoaded]);
  
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
    <>
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
                <Skeleton className="h-12 w-12 rounded-full bg-primary/20 mx-auto animate-pulse" />
                <p className="mt-4 text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          {mapError && !showTokenDialog && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 p-4">
              <Alert variant="destructive" className="w-full max-w-md">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Map Error</AlertTitle>
                <AlertDescription>
                  <p>{mapError}</p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setMapError(null);
                        window.location.reload();
                      }}
                    >
                      Reload Page
                    </Button>
                    <Button 
                      onClick={() => setShowTokenDialog(true)}
                    >
                      Enter Mapbox Token
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Map container */}
          <div ref={mapContainer} className="w-full h-full" />
          
          {/* Map attribution */}
          <div className="absolute bottom-0 right-0 text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded-tl-md">
            © <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a>
          </div>
          
          {/* Helper button to update token */}
          {mapLoaded && (
            <div className="absolute bottom-6 left-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-background/80 text-xs"
                onClick={() => setShowTokenDialog(true)}
              >
                Update Mapbox Token
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Token Input Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Mapbox Access Token</DialogTitle>
            <DialogDescription>
              A Mapbox access token is required to display the map. You can get a free token at 
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline ml-1"
              >
                mapbox.com
              </a>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Mapbox Public Access Token</Label>
              <Input
                id="token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
              />
              <p className="text-xs text-muted-foreground">
                This token will be stored in your browser's localStorage.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveToken} disabled={!tokenInput.trim()}>
              Save & Load Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MapSearch;
