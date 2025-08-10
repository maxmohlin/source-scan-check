import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scan, X, Camera } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
  isScanning: boolean;
  onToggleScanning: () => void;
}

export function Scanner({ onScan, isScanning, onToggleScanning }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [streamControls, setStreamControls] = useState<any>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [isScanning]);

  const startScanning = async () => {
    try {
      setError('');
      
      if (!codeReader.current || !videoRef.current) return;

      setHasPermission(true);
      
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const controls = await codeReader.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            onToggleScanning();
          }
        }
      );
      
      setStreamControls(controls);
    } catch (err) {
      console.error('Scanner error:', err);
      setHasPermission(false);
      setError('Camera access denied or not available');
    }
  };

  const stopScanning = () => {
    if (streamControls) {
      streamControls.stop();
      setStreamControls(null);
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  if (!isScanning) {
    return (
      <Card className="relative overflow-hidden bg-card border-border">
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-scanner-guide/20 flex items-center justify-center">
            <Camera className="w-8 h-8 text-scanner-guide" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Scan Product Barcode</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Point your camera at a barcode to check if the product is connected to USA or other region
            </p>
          </div>
          <Button onClick={onToggleScanning} className="bg-scanner-guide hover:bg-scanner-guide/90 text-scanner-guide-foreground">
            <Scan className="w-4 h-4 mr-2" />
            Start Scanning
          </Button>
          {hasPermission === false && (
            <p className="text-destructive text-sm mt-2">
              Camera permission required to scan barcodes
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="relative aspect-[4/3] w-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Scanner overlay */}
        <div className="absolute inset-0 bg-scanner-overlay">
          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-scanner-overlay" />
          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-scanner-overlay" />
          {/* Left overlay */}
          <div className="absolute top-1/3 bottom-1/3 left-0 w-1/6 bg-scanner-overlay" />
          {/* Right overlay */}
          <div className="absolute top-1/3 bottom-1/3 right-0 w-1/6 bg-scanner-overlay" />
        </div>

        {/* Scanner frame */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-40">
          <div className="w-full h-full border-2 border-scanner-frame rounded-lg relative">
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-scanner-guide rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-scanner-guide rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-scanner-guide rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-scanner-guide rounded-br-lg" />
            
            {/* Scanning line animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-scanner-guide animate-pulse" 
                   style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={onToggleScanning}
            variant="secondary"
            size="sm"
            className="bg-background/20 backdrop-blur border-white/20 text-white hover:bg-background/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-sm bg-background/20 backdrop-blur px-3 py-2 rounded-lg inline-block">
            Position barcode within the frame
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-destructive font-medium mb-2">Scanner Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={onToggleScanning} variant="outline" className="mt-3">
              Try Again
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}