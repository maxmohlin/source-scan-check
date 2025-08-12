import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const isEmbedded = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const requestCameraPermissionInGesture = async () => {
    try {
      setError('');
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }
      const constraints = { video: { facingMode: { ideal: 'environment' } } } as MediaStreamConstraints;
      const temp = await navigator.mediaDevices.getUserMedia(constraints);
      temp.getTracks().forEach((t) => t.stop());
      setHasPermission(true);
      onToggleScanning();
    } catch (err: any) {
      const embedded = isEmbedded();
      console.info('getUserMedia denied in gesture', {
        embedded,
        protocol: window.location?.protocol,
        host: window.location?.host,
        err: { name: err?.name, message: err?.message },
      });
      let message = 'Camera access denied or unavailable.';
      switch (err?.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          message = embedded
            ? 'Camera is blocked in this embedded preview. Open in a new tab to grant permission.'
            : 'Camera permission denied. Check your browser settings and reload.';
          break;
        case 'NotFoundError':
        case 'OverconstrainedError':
          message = 'No suitable camera found. Try Scan from Photo.';
          break;
        case 'SecurityError':
          message = embedded
            ? 'Camera is blocked in this embedded preview. Open in a new tab to grant permission.'
            : 'Camera blocked by browser. Use HTTPS and try again.';
          break;
        default:
          if (err?.message?.includes('MediaDevices')) {
            message = 'Browser does not support camera. Try Scan from Photo.';
          }
      }
      setHasPermission(false);
      setError(message);
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      if (!codeReader.current || !videoRef.current) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }

      if (hasPermission !== true) {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach((t) => t.stop());
        setHasPermission(true);
      }

      // Choose the back camera if available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      const back = videoDevices.find((d) => /back|rear|environment/i.test(d.label));
      const deviceId = (back || videoDevices[0])?.deviceId;

      const controls = await codeReader.current.decodeFromVideoDevice(
        deviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            onToggleScanning();
          }
        }
      );

      setStreamControls(controls);
    } catch (err: any) {
      const embedded = isEmbedded();
      console.error('Scanner error:', err, { name: err?.name, message: err?.message, embedded, protocol: window.location?.protocol });
      setHasPermission(false);
      let message = 'Camera access denied or not available';
      switch (err?.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          message = embedded
            ? 'Camera is blocked in this embedded preview. Open in a new tab to grant permission.'
            : 'Camera permission denied. Enable it in your browser settings, then reload.';
          break;
        case 'NotFoundError':
        case 'OverconstrainedError':
          message = 'No suitable camera found. Try Scan from Photo.';
          break;
        case 'SecurityError':
          message = embedded
            ? 'Camera is blocked in this embedded preview. Open in a new tab to grant permission.'
            : 'Camera blocked by browser. Open this site over HTTPS.';
          break;
        default:
          if (err?.message?.includes('MediaDevices')) {
            message = 'Browser does not support camera. Try Scan from Photo.';
          }
          break;
      }
      setError(message);
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
    (codeReader.current as any)?.reset?.();
  };
  
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !codeReader.current) return;
    try {
      setError('');
      const url = URL.createObjectURL(file);
      const result = await codeReader.current.decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      onScan(result.getText());
    } catch (err) {
      console.error('Image decode error:', err);
      setError('Could not read a barcode from the selected image.');
    } finally {
      e.target.value = '';
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
          <Button onClick={requestCameraPermissionInGesture} className="bg-scanner-guide hover:bg-scanner-guide/90 text-scanner-guide-foreground">
            <Scan className="w-4 h-4 mr-2" />
            Start Scanning
          </Button>
          <div className="mt-2">
            <Button onClick={handlePickImage} variant="outline">
              Scan from Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelected}
            />
          </div>
          {typeof window !== 'undefined' && isEmbedded() && (
            <div className="mt-2">
              <Button variant="ghost" size="sm" onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}>
                Open in new tab (for camera)
              </Button>
            </div>
          )}
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
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button onClick={onToggleScanning} variant="outline">
                Try Again
              </Button>
              {typeof window !== 'undefined' && isEmbedded() && (
                <Button onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}>
                  Open in new tab
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}