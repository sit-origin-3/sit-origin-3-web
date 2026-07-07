import { useState, useEffect, useCallback, useRef } from "react";

export function useSmartRefresh(fetchCallback: () => Promise<void> | void) {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const isMounted = useRef(true);

  const callbackRef = useRef(fetchCallback);
  useEffect(() => {
    callbackRef.current = fetchCallback;
  }, [fetchCallback]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
  }, []);

  const runCycle = useCallback(() => {
    clearTimers();
    if (!isMounted.current) return;

    spinTimerRef.current = setTimeout(() => {
      if (isMounted.current && !isFetchingRef.current) {
        setIsSpinning(true);
      }
    }, 4500);

    timerRef.current = setTimeout(async () => {
      if (!isMounted.current) return;
      isFetchingRef.current = true;
      setIsSpinning(true);

      try {
        await callbackRef.current();
      } finally {
        if (isMounted.current) {
          setIsSpinning(false);
          isFetchingRef.current = false;
          runCycle();
        }
      }
    }, 5000);
  }, [clearTimers]);

  useEffect(() => {
    isMounted.current = true;
    runCycle();
    
    return () => {
      isMounted.current = false;
      clearTimers();
    };
  }, [runCycle, clearTimers]);

  const triggerManualRefresh = useCallback(async () => {
    clearTimers();
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsSpinning(true);
    
    const start = Date.now();
    try {
      await callbackRef.current();
    } finally {
      const elapsed = Date.now() - start;
      const minSpinTime = 1000;
      const remainingTime = Math.max(0, minSpinTime - elapsed);
      
      if (remainingTime > 0) {
        setTimeout(() => {
          if (isMounted.current) {
            setIsSpinning(false);
            isFetchingRef.current = false;
            runCycle();
          }
        }, remainingTime);
      } else {
        if (isMounted.current) {
          setIsSpinning(false);
          isFetchingRef.current = false;
          runCycle();
        }
      }
    }
  }, [clearTimers, runCycle]);

  return { isSpinning, triggerManualRefresh };
}
