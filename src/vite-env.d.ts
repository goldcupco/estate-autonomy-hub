
/// <reference types="vite/client" />

// Add type declarations for react-leaflet custom props
declare module 'react-leaflet' {
  import { Map as LeafletMap, TileLayer as LeafletTileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from 'leaflet';
  import * as React from 'react';

  // Add exported components that TypeScript is not finding
  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Popup: React.FC<PopupProps>;
  export const AttributionControl: React.FC<AttributionControlProps>;
  export function useMap(): LeafletMap;

  // Define interfaces for the components
  export interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    whenReady?: (map: any) => void;
    scrollWheelZoom?: boolean;
    center?: [number, number];
    zoom?: number;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export interface MarkerProps {
    position: [number, number];
    eventHandlers?: any;
  }

  export interface PopupProps {
    children?: React.ReactNode;
  }

  export interface AttributionControlProps {
    position?: 'bottomright' | 'bottomleft' | 'topright' | 'topleft';
    prefix?: boolean | string;
  }
}
