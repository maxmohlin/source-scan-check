// Mock product database - in real app this would call an API
const mockProductDatabase = new Map([
  ['8901030859414', {
    name: 'Coca-Cola Classic',
    brand: 'The Coca-Cola Company',
    connectedToUSA: true,
    connectedToIsrael: false,
    description: 'American multinational beverage corporation',
    source: 'Company origin database'
  }],
  ['7290000010200', {
    name: 'Strauss Ice Cream',
    brand: 'Strauss Group',
    connectedToUSA: false,
    connectedToIsrael: true,
    description: 'Israeli food and beverage company',
    source: 'Company origin database'
  }],
  ['8901030810033', {
    name: 'McDonald\'s Sauce',
    brand: 'McDonald\'s Corporation',
    connectedToUSA: true,
    connectedToIsrael: true,
    description: 'American fast food corporation with Israeli franchises',
    source: 'Company origin database'
  }],
  ['3017620425035', {
    name: 'Nutella',
    brand: 'Ferrero',
    connectedToUSA: false,
    connectedToIsrael: false,
    description: 'Italian manufacturer with global operations',
    source: 'Company origin database'
  }],
  ['0012000171901', {
    name: 'Pepsi Cola',
    brand: 'PepsiCo',
    connectedToUSA: true,
    connectedToIsrael: false,
    description: 'American multinational food and beverage corporation',
    source: 'Company origin database'
  }]
]);

export interface ProductData {
  name: string;
  brand: string;
  barcode: string;
  connectedToUSA: boolean;
  connectedToIsrael: boolean;
  description?: string;
  source?: string;
}

export async function lookupProduct(barcode: string): Promise<ProductData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const productInfo = mockProductDatabase.get(barcode);
  
  if (productInfo) {
    return {
      ...productInfo,
      barcode
    };
  }
  
  // Try to get product info from Open Food Facts API as fallback
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      // Basic analysis of brand/company names for USA/Israel connections
      const brandName = product.brands || '';
      const companyName = product.companies || '';
      const countries = product.countries || '';
      
      const textToAnalyze = `${brandName} ${companyName} ${countries}`.toLowerCase();
      
      // Simple keyword matching - in real app this would be more sophisticated
      const connectedToUSA = /usa|united states|america|american|california|new york|texas/.test(textToAnalyze);
      const connectedToIsrael = /israel|israeli|tel aviv|jerusalem/.test(textToAnalyze);
      
      return {
        name: product.product_name || 'Unknown Product',
        brand: brandName || 'Unknown Brand',
        barcode,
        connectedToUSA,
        connectedToIsrael,
        description: `Product found in database - analysis based on available information`,
        source: 'Open Food Facts + Analysis'
      };
    }
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error);
  }
  
  // Return unknown product
  return {
    name: 'Product Not Found',
    brand: 'Unknown',
    barcode,
    connectedToUSA: false,
    connectedToIsrael: false,
    description: 'This product is not in our database. Consider adding it to help the community.',
    source: 'Not found'
  };
}