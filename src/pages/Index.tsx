import { useState } from 'react';
import { Scanner } from '@/components/Scanner';
import { ProductResult } from '@/components/ProductResult';
import { lookupProduct, ProductData } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { Shield, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    
    try {
      const productData = await lookupProduct(barcode);
      setProduct(productData);
      
      // Show toast notification
      if (productData.connectedToUSA || productData.connectedToIsrael) {
        toast({
          title: "Connection Found",
          description: `${productData.name} has connections to ${productData.connectedToUSA ? 'USA' : ''}${productData.connectedToUSA && productData.connectedToIsrael ? ' and ' : ''}${productData.connectedToIsrael ? 'other region' : ''}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Connections Found",
          description: `${productData.name} appears to be clear`,
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to lookup product. Please try again.';
      setError(errorMessage);
      toast({
        title: "Lookup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAnother = () => {
    setProduct(null);
    setError(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Product Scanner</h1>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Info className="w-4 h-4" />
            <span className="text-sm">USA & Other Connections</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {/* App Description */}
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Scan product barcodes to check if they're connected to USA or other region companies. 
              Make informed purchasing decisions based on your values.
            </p>
          </Card>

          {/* Scanner Component */}
          <Scanner 
            onScan={handleScan}
            isScanning={isScanning}
            onToggleScanning={() => setIsScanning(!isScanning)}
          />

          {/* Results */}
          {(product || isLoading || error) && (
            <ProductResult
              product={product}
              isLoading={isLoading}
              error={error}
              onScanAnother={handleScanAnother}
            />
          )}

          {/* Footer Info */}
          <Card className="p-4 bg-muted/20">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium">How it works</h3>
              <p className="text-xs text-muted-foreground">
                We analyze product brands, manufacturers, and parent companies to identify connections 
                to USA and other region businesses. Data sources include company databases and public information.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
