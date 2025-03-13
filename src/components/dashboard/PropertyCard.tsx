
import { useState } from 'react';
import { Building, MapPin, Heart, DollarSign } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: {
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
  };
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const PropertyCard = ({ property, className, style, onClick }: PropertyCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Format price to USD
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);
  
  // Status badge styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'For Sale':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Sold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Negotiating':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking favorite
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group animate-scale-in",
        onClick ? "cursor-pointer" : "",
        className
      )} 
      style={style}
      onClick={onClick}
    >
      <div className="relative">
        <AspectRatio ratio={4/3} className="bg-muted">
          {/* Image with blur-up loading effect */}
          <div className={cn("absolute inset-0 bg-muted transition-opacity duration-300", 
            isLoading ? "opacity-100" : "opacity-0"
          )} />
          <img
            src={property.imageUrl || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'}
            alt={property.address}
            className={cn(
              "object-cover w-full h-full transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
          />
        </AspectRatio>
        
        {/* Status badge */}
        <Badge className={cn(
          "absolute top-3 left-3 px-2 py-1 text-xs font-medium",
          getStatusStyles(property.status)
        )}>
          {property.status}
        </Badge>
        
        {/* Favorite button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 dark:bg-black/50 dark:hover:bg-black/70 text-muted-foreground hover:text-rose-500"
          onClick={handleFavorite}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-rose-500 text-rose-500")} />
        </Button>
        
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center text-white">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-bold">{formattedPrice}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {property.address}
          </h3>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span>{property.city}, {property.state} {property.zipCode}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="font-medium">{property.bedrooms}</span>
            <span className="text-xs text-muted-foreground">Beds</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="font-medium">{property.bathrooms}</span>
            <span className="text-xs text-muted-foreground">Baths</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="font-medium">{property.sqft.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Sq Ft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
