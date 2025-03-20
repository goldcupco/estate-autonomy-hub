
import { createContext, useContext, ReactNode, useState } from 'react';
import { Property } from '@/pages/Properties';

interface PropertyContextType {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  editingProperty: Property | null;
  setEditingProperty: (property: Property | null) => void;
  addPropertyOpen: boolean;
  setAddPropertyOpen: (open: boolean) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        setProperties,
        isLoading,
        setIsLoading,
        editingProperty,
        setEditingProperty,
        addPropertyOpen,
        setAddPropertyOpen,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}
