
import { useState } from 'react';
import { PropertyCard } from '@/components/dashboard/PropertyCard';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, GridIcon, ListIcon, Search, SlidersHorizontal } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'For Sale' | 'Pending' | 'Sold' | 'Lead' | 'Negotiating';
  imageUrl: string;
  propertyType?: 'House' | 'Land' | 'Condo' | 'Apartment' | 'Commercial';
}

interface PropertyGridProps {
  properties: Property[];
  onPropertyClick?: (id: string) => void;
}

export function PropertyGrid({ properties, onPropertyClick }: PropertyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = searchTerm === '' || 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesPropertyType = propertyTypeFilter === 'all' || property.propertyType === propertyTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPropertyType;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    // For demo, we'll just use the ID as a proxy for "newest" since we don't have date fields
    if (sortOrder === 'newest') return b.id.localeCompare(a.id);
    return 0;
  });

  // Count properties by status
  const statusCounts = properties.reduce((acc, property) => {
    acc[property.status] = (acc[property.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count properties by type
  const typeCounts = properties.reduce((acc, property) => {
    const type = property.propertyType || 'House';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={statusFilter === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('all')}
          className="rounded-full"
        >
          All Properties ({properties.length})
        </Button>
        <Button 
          variant={statusFilter === 'For Sale' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('For Sale')}
          className="rounded-full"
        >
          Active Listings ({statusCounts['For Sale'] || 0})
        </Button>
        <Button 
          variant={statusFilter === 'Pending' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('Pending')}
          className="rounded-full"
        >
          Pending ({statusCounts['Pending'] || 0})
        </Button>
        <Button 
          variant={statusFilter === 'Sold' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('Sold')}
          className="rounded-full"
        >
          Sold ({statusCounts['Sold'] || 0})
        </Button>
        <Button 
          variant={statusFilter === 'Lead' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('Lead')}
          className="rounded-full"
        >
          Leads ({statusCounts['Lead'] || 0})
        </Button>
        <Button 
          variant={statusFilter === 'Negotiating' ? "default" : "outline"} 
          size="sm"
          onClick={() => setStatusFilter('Negotiating')}
          className="rounded-full"
        >
          Negotiating ({statusCounts['Negotiating'] || 0})
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-[300px]"
          />
        </div>
        
        <div className="flex flex-wrap justify-end gap-2">
          {/* Status filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="all">All Properties</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="For Sale">For Sale</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Sold">Sold</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Lead">Lead</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Negotiating">Negotiating</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Property Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={propertyTypeFilter} 
                onValueChange={setPropertyTypeFilter}
              >
                <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="House">Houses ({typeCounts['House'] || 0})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Land">Land ({typeCounts['Land'] || 0})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Condo">Condos ({typeCounts['Condo'] || 0})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Apartment">Apartments ({typeCounts['Apartment'] || 0})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Commercial">Commercial ({typeCounts['Commercial'] || 0})</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort order */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Sort
                <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup 
                value={sortOrder} 
                onValueChange={setSortOrder}
              >
                <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* View mode toggle */}
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedProperties.length} of {properties.length} properties
      </div>
      
      {/* Property grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all animate-scale-in">
          {sortedProperties.map((property, index) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              className="opacity-0 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              onClick={() => onPropertyClick && onPropertyClick(property.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {sortedProperties.map((property, index) => (
            <div 
              key={property.id}
              className="glass-card rounded-lg overflow-hidden transition-all hover:shadow-md hover:bg-accent/10 flex flex-col md:flex-row opacity-0 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              onClick={() => onPropertyClick && onPropertyClick(property.id)}
            >
              <div className="w-full md:w-48 h-48 md:h-auto relative flex-shrink-0">
                <img 
                  src={property.imageUrl || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block
                    ${property.status === 'For Sale' ? 'bg-green-100 text-green-800' : 
                      property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      property.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 
                      property.status === 'Lead' ? 'bg-purple-100 text-purple-800' : 
                      'bg-orange-100 text-orange-800'}`
                  }>
                    {property.status}
                  </span>
                </div>
                {property.propertyType && (
                  <div className="absolute top-8 left-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full inline-block bg-gray-100 text-gray-800">
                      {property.propertyType}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{property.address}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(property.price)}
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  {property.propertyType !== 'Land' ? (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">{property.bedrooms}</span> Beds
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{property.bathrooms}</span> Baths
                      </div>
                    </>
                  ) : null}
                  <div className="text-sm">
                    <span className="font-medium">{property.sqft.toLocaleString()}</span> {property.propertyType === 'Land' ? 'Acres' : 'Sq Ft'}
                  </div>
                  {property.propertyType && (
                    <div className="text-sm">
                      <span className="font-medium">{property.propertyType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyGrid;
