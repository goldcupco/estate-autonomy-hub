
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Property {
  id: string;
  address: string;
  imageUrl: string;
}

interface PropertyImageGalleryProps {
  property: Property;
}

// Mock additional images for the property with complete URLs
const ADDITIONAL_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1600&q=80", // Replaced problematic URL with working one
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80" // Completely replaced the 4th image with a reliable Unsplash photo
];

export function PropertyImageGallery({ property }: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Combine main image with additional images
  const allImages = [property.imageUrl, ...ADDITIONAL_IMAGES];
  
  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? allImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  
  const goToNext = () => {
    const isLastImage = currentIndex === allImages.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load image at index ${index}: ${allImages[index]}`);
  };
  
  return (
    <div className="relative">
      {/* Main image display */}
      <div className="relative aspect-[16/9] bg-muted">
        {imageErrors[currentIndex] ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageOff className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <img 
            src={allImages[currentIndex]} 
            alt={`${property.address} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(currentIndex)}
          />
        )}
        
        {/* Navigation arrows */}
        <Button 
          variant="outline" 
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Fullscreen button */}
        <Button 
          variant="outline" 
          size="icon"
          className="absolute right-2 top-2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
          onClick={() => setLightboxOpen(true)}
        >
          <Maximize className="h-4 w-4" />
        </Button>
        
        {/* Image counter */}
        <div className="absolute left-2 bottom-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {allImages.length}
        </div>
      </div>
      
      {/* Thumbnail strip */}
      <div className="flex overflow-x-auto p-2 gap-2 bg-muted/50">
        {allImages.map((img, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all ${currentIndex === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => goToImage(index)}
          >
            {imageErrors[index] ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageOff className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Lightbox dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {imageErrors[currentIndex] ? (
              <div className="flex flex-col items-center justify-center text-white">
                <ImageOff className="h-20 w-20 mb-4" />
                <p>Image could not be loaded</p>
              </div>
            ) : (
              <img 
                src={allImages[currentIndex]} 
                alt={`${property.address} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={() => handleImageError(currentIndex)}
              />
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/30 rounded-full h-10 w-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/30 rounded-full h-10 w-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
