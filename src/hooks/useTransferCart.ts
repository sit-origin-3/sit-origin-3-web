import { useState, useCallback } from "react";
import type { ReceiverProfile } from "../services/pointsService";

export function useTransferCart() {
  const [receivers, setReceivers] = useState<ReceiverProfile[]>([]);

  const addReceiver = useCallback((receiver: ReceiverProfile) => {
    setReceivers((prev) => {
      if (prev.some((r) => r.userCode === receiver.userCode)) {
        return prev;
      }
      return [...prev, receiver];
    });
  }, []);

  const removeReceiver = useCallback((userCode: string) => {
    setReceivers((prev) => prev.filter((r) => r.userCode !== userCode));
  }, []);

  const clearReceivers = useCallback(() => {
    setReceivers([]);
  }, []);

  return {
    receivers,
    addReceiver,
    removeReceiver,
    clearReceivers,
  };
}
