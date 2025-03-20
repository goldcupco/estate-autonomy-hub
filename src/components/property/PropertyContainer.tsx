
import { PropertyProvider } from '@/contexts/PropertyContext';
import { Properties } from '@/pages/Properties';

export function PropertyContainer() {
  return (
    <PropertyProvider>
      <Properties />
    </PropertyProvider>
  );
}

export default PropertyContainer;
