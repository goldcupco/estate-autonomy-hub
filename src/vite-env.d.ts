
/// <reference types="vite/client" />

// Add type declarations for react-leaflet custom props
declare module 'react-leaflet' {
  import { Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';
  import * as React from 'react';

  // Extend with any missing props that are causing TypeScript errors
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
}
