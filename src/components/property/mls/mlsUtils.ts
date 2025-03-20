
/**
 * Simulates an API call to an MLS provider
 * In a production environment, this would make a real API call
 */
export async function simulateMLSApiImport(provider: string): Promise<any[]> {
  // Simulate API call with a timeout
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Sample property data (would come from the MLS API in a real implementation)
  return Array(Math.floor(Math.random() * 10) + 5)
    .fill(null)
    .map((_, index) => ({
      id: `imported-${Date.now()}-${index}`,
      address: `${1000 + index} MLS Import Street`,
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      price: 500000 + (Math.random() * 1000000),
      bedrooms: Math.floor(Math.random() * 5) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 800,
      status: ['For Sale', 'Pending', 'Sold'][Math.floor(Math.random() * 3)] as 'For Sale' | 'Pending' | 'Sold',
      imageUrl: `https://images.unsplash.com/photo-${1568605114967 + index}-8130f3a36994`
    }));
}
