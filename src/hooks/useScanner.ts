import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerState {
  isScanning: boolean;
  isFlashOn: boolean;
  isFlashSupported: boolean;
  cameraError: string | null;
}

interface UseScannerReturn extends ScannerState {
  startScan: (onResult: (code: string) => void) => Promise<void>;
  stopScan: () => Promise<void>;
  toggleFlash: () => Promise<void>;
  scannerElementId: string;
}

const ELEMENT_ID = "qr-scanner-region";

export function useScanner(): UseScannerReturn {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const callbackRef = useRef<((code: string) => void) | null>(null);

  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    isFlashOn: false,
    isFlashSupported: false,
    cameraError: null,
  });

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      /* already stopped */
    }
    setState((s) => ({
      ...s,
      isScanning: false,
      isFlashOn: false,
      isFlashSupported: false,
    }));
  }, []);

  const startScan = useCallback(
    async (onResult: (code: string) => void) => {
      callbackRef.current = onResult;
      setState((s) => ({ ...s, cameraError: null }));

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(ELEMENT_ID);
      }

      const scanner = scannerRef.current;

      if (scanner.isScanning) {
        await stopScan();
      }

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            callbackRef.current?.(decodedText);
          },
          undefined,
        );

        let flashSupported = false;
        try {
          const caps = scanner.getRunningTrackCameraCapabilities();
          flashSupported = caps.torchFeature().isSupported();
        } catch {
          /* no torch */
        }

        setState({
          isScanning: true,
          isFlashOn: false,
          isFlashSupported: flashSupported,
          cameraError: null,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "ไม่สามารถเปิดกล้องได้";
        setState((s) => ({ ...s, cameraError: message, isScanning: false }));
      }
    },
    [stopScan],
  );

  const toggleFlash = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || !scanner.isScanning) return;

    try {
      const torch = scanner.getRunningTrackCameraCapabilities().torchFeature();
      if (!torch.isSupported()) return;

      const next = !state.isFlashOn;
      await torch.apply(next);
      setState((s) => ({ ...s, isFlashOn: next }));
    } catch {
      /* torch control failed */
    }
  }, [state.isFlashOn]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  return {
    ...state,
    startScan,
    stopScan,
    toggleFlash,
    scannerElementId: ELEMENT_ID,
  };
}
