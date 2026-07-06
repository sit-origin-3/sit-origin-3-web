import { useState, useEffect, useCallback, useRef } from "react";
import { AxiosError } from "axios";
import {
  ScanLine,
  Flashlight,
  FlashlightOff,
  Keyboard,
  X,
  User,
  Star,
  Users,
  Loader2,
  CheckCircle2,
  Send,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useScanner } from "../../hooks/useScanner";
import {
  getUserByCode,
  givePoints,
  type ReceiverProfile,
} from "../../services/pointsService";

type Phase = "SCANNING" | "VERIFYING" | "AMOUNT" | "SENDING" | "SUCCESS";

function ReceiverCard({
  receiver,
  onCancel,
  onConfirm,
}: {
  receiver: ReceiverProfile;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-zpd-500 shadow-hard">
          <User className="h-8 w-8 text-white" strokeWidth={2} />
        </div>

        <div className="text-center">
          <h2 className="text-h3 text-zpd-900">
            {receiver.firstname} {receiver.lastname}
          </h2>
          <p className="text-body text-neutral-500">"{receiver.nickname}"</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-zpd-400/40 bg-zpd-400/20 px-3 py-1 text-caption font-bold text-zpd-700">
            <Users className="h-3 w-3" />
            {receiver.group}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-fox-400/40 bg-fox-400/20 px-3 py-1 text-caption font-bold text-fox-700">
            <Star className="h-3 w-3" />
            {receiver.points.toLocaleString()} คะแนน
          </span>
        </div>

        <p className="font-mono text-caption tracking-widest text-neutral-400">
          {receiver.userCode}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 px-4 py-3 text-body-lg font-bold text-zpd-800 transition-all hover:bg-white/70 active:translate-y-0.5 active:shadow-none"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-4 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none"
        >
          <Send className="h-4 w-4" />
          ให้คะแนน
        </button>
      </div>
    </div>
  );
}

export default function TransferPoints() {
  const {
    isFlashOn,
    isFlashSupported,
    cameraError,
    startScan,
    stopScan,
    toggleFlash,
    scannerElementId,
  } = useScanner();

  const [phase, setPhase] = useState<Phase>("SCANNING");
  const [receiver, setReceiver] = useState<ReceiverProfile | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const processedRef = useRef(false);

  const resetToScanner = useCallback(() => {
    setPhase("SCANNING");
    setReceiver(null);
    setAmount("");
    setError(null);
    setShowManualInput(false);
    setManualCode("");
    setIsLookingUp(false);
    setIsSending(false);
    processedRef.current = false;
  }, []);

  const lookupUser = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return;

      setIsLookingUp(true);
      setError(null);

      try {
        await stopScan();
        const user = await getUserByCode(trimmed);
        setReceiver(user);
        setPhase("VERIFYING");
      } catch (err: unknown) {
        const msg =
          err instanceof AxiosError && err.response?.status === 404
            ? `ไม่พบผู้ใช้รหัส "${trimmed}"`
            : err instanceof AxiosError &&
                (typeof err.response?.data?.message === "string"
                  ? err.response.data.message
                  : typeof err.response?.data?.error === "string"
                    ? err.response.data.error
                    : "เกิดข้อผิดพลาดในการค้นหาผู้ใช้")
        setError(msg);
        processedRef.current = false;
      } finally {
        setIsLookingUp(false);
      }
    },
    [stopScan],
  );

  const handleScanResult = useCallback(
    (decodedText: string) => {
      if (processedRef.current) return;
      processedRef.current = true;
      lookupUser(decodedText);
    },
    [lookupUser],
  );

  useEffect(() => {
    if (phase === "SCANNING" && !showManualInput && !processedRef.current) {
      startScan(handleScanResult);
    }
  }, [phase, showManualInput, startScan, handleScanResult]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim().length < 2) return;
    processedRef.current = true;
    lookupUser(manualCode);
  };

  const handleConfirmReceiver = () => {
    setPhase("AMOUNT");
    setError(null);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver) return;

    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("กรุณากรอกจำนวนคะแนนที่ถูกต้อง");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await givePoints({
        receiverCode: receiver.userCode,
        amount: parsedAmount,
      });
      setPhase("SUCCESS");
    } catch (err: unknown) {
      const msg =
        err instanceof AxiosError &&
        (typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : typeof err.response?.data?.error === "string"
            ? err.response.data.error
            : "การโอนคะแนนล้มเหลว")
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  if (phase === "SUCCESS") {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[32px] border-2 border-white/60 bg-white/40 p-8 shadow-cartoon backdrop-blur-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-jungle-500/20">
            <CheckCircle2
              className="h-10 w-10 text-jungle-500"
              strokeWidth={2.5}
            />
          </div>
          <div className="text-center">
            <h1 className="text-h2 text-zpd-900">โอนสำเร็จ!</h1>
            <p className="mt-1 text-body text-neutral-500">
              ให้{" "}
              <span className="font-bold text-fox-500">
                {parseInt(amount, 10).toLocaleString()}
              </span>{" "}
              คะแนนแก่{" "}
              <span className="font-bold text-zpd-700">
                {receiver?.nickname}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={resetToScanner}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none"
          >
            <ScanLine className="h-5 w-5" />
            สแกนต่อ
          </button>
        </div>
      </main>
    );
  }

  if (phase === "VERIFYING" && receiver) {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <h1 className="mb-4 text-center text-h2 text-zpd-900">
            ยืนยันผู้รับ
          </h1>
          <ReceiverCard
            receiver={receiver}
            onCancel={resetToScanner}
            onConfirm={handleConfirmReceiver}
          />
        </div>
      </main>
    );
  }

  if (phase === "AMOUNT" && receiver) {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">
          <button
            type="button"
            onClick={() => setPhase("VERIFYING")}
            className="flex min-h-[44px] items-center gap-1 rounded-2xl px-3 py-2 text-body font-semibold text-zpd-700 transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>

          <div className="rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zpd-500/10">
                <User className="h-5 w-5 text-zpd-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-body font-bold text-zpd-900">
                  {receiver.nickname}
                </p>
                <p className="text-caption text-neutral-400">
                  {receiver.firstname} {receiver.lastname}
                </p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label
                  htmlFor="amount-input"
                  className="mb-1 block text-caption font-semibold text-zpd-700"
                >
                  จำนวนคะแนน
                </label>
                <input
                  id="amount-input"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={amount}
                  onChange={(e) => {
                    setError(null);
                    setAmount(e.target.value.replace(/\D/g, ""));
                  }}
                  placeholder="0"
                  autoFocus
                  className="h-14 w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-center font-mono text-h1 text-zpd-900 shadow-cartoon backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:ring-2 focus:ring-zpd-400/30"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-caption font-semibold text-pawp-500">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !amount || parseInt(amount, 10) <= 0}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    ยืนยันโอน {amount ? parseInt(amount, 10).toLocaleString() : 0}{" "}
                    คะแนน
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-start px-4 py-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-h2 text-zpd-900">
          <ScanLine className="mr-2 inline-block h-6 w-6 text-fox-500" />
          โอนคะแนน
        </h1>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-caption font-semibold text-pawp-500">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!showManualInput && (
          <div className="overflow-hidden rounded-3xl border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-lg">
            <div
              id={scannerElementId}
              className="relative aspect-square w-full bg-neutral-900"
            />

            <div className="flex items-center justify-center gap-3 p-3">
              {isFlashSupported && (
                <button
                  type="button"
                  onClick={toggleFlash}
                  className="flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-white/60 bg-white/50 px-4 py-2.5 text-body font-bold text-zpd-800 transition-all hover:bg-white/70 active:translate-y-0.5"
                >
                  {isFlashOn ? (
                    <FlashlightOff className="h-5 w-5" />
                  ) : (
                    <Flashlight className="h-5 w-5" />
                  )}
                  {isFlashOn ? "ปิดแฟลช" : "เปิดแฟลช"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stopScan();
                  setShowManualInput(true);
                }}
                className="flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-white/60 bg-white/50 px-4 py-2.5 text-body font-bold text-zpd-800 transition-all hover:bg-white/70 active:translate-y-0.5"
              >
                <Keyboard className="h-5 w-5" />
                กรอกรหัส
              </button>
            </div>
          </div>
        )}

        {cameraError && !showManualInput && (
          <div className="rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-center text-caption font-semibold text-pawp-500">
            {cameraError}
          </div>
        )}

        {showManualInput && (
          <div className="rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-h3 text-zpd-900">กรอกรหัสผู้ใช้</h2>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualCode("");
                  setError(null);
                  processedRef.current = false;
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => {
                  setError(null);
                  setManualCode(e.target.value.toUpperCase());
                }}
                placeholder="เช่น FL72"
                maxLength={6}
                autoFocus
                className="h-14 w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-center font-mono text-h2 uppercase tracking-[0.3em] text-zpd-900 shadow-cartoon backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:ring-2 focus:ring-zpd-400/30"
              />
              <button
                type="submit"
                disabled={isLookingUp || manualCode.trim().length < 2}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLookingUp ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "ค้นหา"
                )}
              </button>
            </form>
          </div>
        )}

        {isLookingUp && !showManualInput && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-zpd-500" />
            <p className="text-body text-zpd-700">กำลังค้นหาผู้ใช้...</p>
          </div>
        )}
      </div>
    </main>
  );
}
