import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, Scan } from 'lucide-react';

interface ProductData {
  name: string;
  brand: string;
  barcode: string;
  connectedToUSA: boolean;
  connectedToIsrael: boolean;
  description?: string;
  source?: string;
}

interface ProductResultProps {
  product: ProductData | null;
  isLoading: boolean;
  error: string | null;
  onScanAnother: () => void;
}

export function ProductResult({ product, isLoading, error, onScanAnother }: ProductResultProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Product...</h3>
            <p className="text-muted-foreground text-sm">
              Checking connections to USA and other region
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={onScanAnother} variant="outline">
              <Scan className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!product) {
    return null;
  }

  const getConnectionStatus = () => {
    if (product.connectedToUSA && product.connectedToIsrael) {
      return {
        icon: AlertTriangle,
        text: 'Connected to both USA & other region',
        color: 'destructive',
        bgColor: 'bg-destructive/10'
      };
    } else if (product.connectedToUSA) {
      return {
        icon: Info,
        text: 'Connected to USA',
        color: 'connection-usa',
        bgColor: 'bg-blue-500/10'
      };
    } else if (product.connectedToIsrael) {
      return {
        icon: Info,
        text: 'Connected to other region',
        color: 'connection-israel',
        bgColor: 'bg-cyan-500/10'
      };
    } else {
      return {
        icon: CheckCircle,
        text: 'No concerning connections found',
        color: 'connection-clean',
        bgColor: 'bg-green-500/10'
      };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  const sanitizeText = (text: string) => text.replace(/israeli|israel/gi, 'other region');

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-full ${status.bgColor} flex items-center justify-center mx-auto`}>
          <StatusIcon className={`w-8 h-8 text-${status.color}`} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-1">{product.name}</h2>
          <p className="text-muted-foreground">{product.brand}</p>
        </div>

        <Badge 
          variant={status.color === 'destructive' ? 'destructive' : 'secondary'}
          className="text-sm px-3 py-1"
        >
          {status.text}
        </Badge>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Barcode:</span>
          <span className="font-mono">{product.barcode}</span>
        </div>

        <div className="flex justify-between items-start text-sm">
          <span className="text-muted-foreground">USA Connection:</span>
          <Badge variant={product.connectedToUSA ? 'secondary' : 'outline'} className="text-xs">
            {product.connectedToUSA ? 'Yes' : 'No'}
          </Badge>
        </div>

        <div className="flex justify-between items-start text-sm">
          <span className="text-muted-foreground">Other Region Connection:</span>
          <Badge variant={product.connectedToIsrael ? 'secondary' : 'outline'} className="text-xs">
            {product.connectedToIsrael ? 'Yes' : 'No'}
          </Badge>
        </div>

        {product.description && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">{sanitizeText(product.description)}</p>
          </div>
        )}

        {product.source && (
          <div className="text-xs text-muted-foreground">
            Source: {sanitizeText(product.source)}
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button onClick={onScanAnother} className="w-full" variant="outline">
          <Scan className="w-4 h-4 mr-2" />
          Scan Another Product
        </Button>
      </div>
    </Card>
  );
}