import { useState, useCallback, useRef, useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { AxiosError } from "axios";
import {
  ScanLine,
  Flashlight,
  FlashlightOff,
  Keyboard,
  User,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Send,
  Camera,
} from "lucide-react";
import { useScanner } from "../../hooks/useScanner";
import { useTransferCart } from "../../hooks/useTransferCart";
import {
  getUserByCode,
  type ReceiverProfile,
  type ExceededUser,
} from "../../services/pointsService";
import ManualCodeModal from "../../components/staff/ManualCodeModal";
import TransferBottomSheet from "../../components/staff/TransferBottomSheet";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getAvatarBg } from "../../utils/avatar";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../../hooks/useGroupName";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Phase = "SCANNING" | "SCANNED" | "RESULTS";

export default function TransferPoints() {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const {
    isInitializing,
    isFlashOn,
    isFlashSupported,
    cameraError,
    startScan,
    stopScan,
    toggleFlash,
    scannerElementId,
  } = useScanner();

  const { receivers, addReceiver, removeReceiver, clearReceivers } =
    useTransferCart();

  const [phase, setPhase] = useState<Phase>("SCANNING");
  const [currentReceiver, setCurrentReceiver] =
    useState<ReceiverProfile | null>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      receivers.length > 0 &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  const [showManualModal, setShowManualModal] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const [transferResults, setTransferResults] = useState<{
    successful: number;
    failed: number;
    total: number;
    receivers: string[];
    exceeded: ExceededUser[];
  } | null>(null);

  const processedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (phase === "SCANNING" || phase === "SCANNED") {
        gsap.fromTo(
          ".gsap-scanner-item",
          {
            y: 15,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
      }
    },
    { scope: containerRef, dependencies: [phase] },
  );

  const lookupUser = useCallback(
    async (code: string, isManual: boolean = false) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return;

      setIsLookingUp(true);
      if (isManual) setManualError(null);
      else setGlobalError(null);

      try {
        await stopScan();
        const user = await getUserByCode(trimmed);
        setCurrentReceiver(user);

        if (isManual) setShowManualModal(false);
        setPhase("SCANNED");
      } catch (err: unknown) {
        const msg =
          err instanceof AxiosError && err.response?.status === 404
            ? t("transfer.notFoundError", { code: trimmed })
            : err instanceof AxiosError &&
              (typeof err.response?.data?.message === "string"
                ? err.response.data.message
                : typeof err.response?.data?.error === "string"
                  ? err.response.data.error
                  : t("common.error"));

        if (isManual) {
          setManualError(msg);
        } else {
          setGlobalError(msg);
          // Resume scanning after 3 seconds on scan error
          setTimeout(() => {
            processedRef.current = false;
            setPhase("SCANNING");
          }, 3000);
        }
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
      lookupUser(decodedText, false);
    },
    [lookupUser],
  );

  useEffect(() => {
    if (
      phase === "SCANNING" &&
      !showManualModal &&
      !showCartSheet &&
      !processedRef.current
    ) {
      startScan(handleScanResult);
    }
  }, [phase, showManualModal, showCartSheet, startScan, handleScanResult]);

  const resumeScanning = () => {
    setPhase("SCANNING");
    setCurrentReceiver(null);
    setGlobalError(null);
    processedRef.current = false;
  };

  const handleScanMore = () => {
    if (currentReceiver) {
      addReceiver(currentReceiver);
    }
    resumeScanning();
  };

  const handleTransferNow = () => {
    if (currentReceiver) {
      addReceiver(currentReceiver);
    }
    setCurrentReceiver(null);
    setShowCartSheet(true);
  };

  const handleTransferComplete = (results: {
    successful: number;
    failed: number;
    total: number;
    receivers: string[];
    exceeded: ExceededUser[];
  }) => {
    setShowCartSheet(false);
    clearReceivers();
    setTransferResults(results);
    setPhase("RESULTS");
  };

  if (phase === "RESULTS" && transferResults) {
    const isPartial =
      transferResults.failed > 0 && transferResults.successful > 0;
    const isFail = transferResults.successful === 0;

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zpd-50 p-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[32px] border-2 border-white/60 bg-white/40 p-8 shadow-cartoon backdrop-blur-lg">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${isFail ? "bg-pawp-500/20" : isPartial ? "bg-fox-500/20" : "bg-jungle-500/20"}`}
          >
            {isFail ? (
              <AlertTriangle
                className="h-10 w-10 text-pawp-500"
                strokeWidth={2.5}
              />
            ) : (
              <CheckCircle2
                className={`h-10 w-10 ${isPartial ? "text-fox-500" : "text-jungle-500"}`}
                strokeWidth={2.5}
              />
            )}
          </div>
          <div className="text-center w-full">
            <h1 className="text-h2 text-zpd-900">
              {isFail
                ? t("transfer.fail")
                : isPartial
                  ? t("transfer.partialSuccess")
                  : t("transfer.success")}
            </h1>
            <p className="mt-2 text-body font-medium text-neutral-600">
              {t("transfer.successSummary", { count: transferResults.successful })} |{" "}
              <span className={transferResults.failed > 0 ? "text-pawp-500 font-bold" : ""}>
                {t("transfer.failSummary", { count: transferResults.failed })}
              </span>
            </p>

            {transferResults.exceeded && transferResults.exceeded.length > 0 && (
              <div className="mt-4 flex max-h-[40vh] w-full flex-col gap-2 overflow-y-auto pr-1">
                {transferResults.exceeded.map((u) => (
                  <div
                    key={u.userCode}
                    className="flex flex-col items-start justify-between rounded-xl bg-white/40 p-3 shadow-sm backdrop-blur-sm border border-white/50 text-left"
                  >
                    <div className="font-bold text-zpd-900">
                      {u.nickname} ({u.userCode})
                    </div>
                    <div className="text-caption font-semibold text-pawp-600 mt-1 bg-white/50 px-2 py-0.5 rounded-md">
                      {t("transfer.remainingQuota", { remaining: u.remaining })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setTransferResults(null);
              resumeScanning();
            }}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none"
          >
            <ScanLine className="h-5 w-5" />
            {t("transfer.backToScan")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black"
    >
      {/* FULL SCREEN CAMERA */}
      <div
        id={scannerElementId}
        className={`absolute inset-0 z-0 h-full w-full object-cover [&_#qr-shaded-region]:hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover ${isInitializing ? "opacity-0" : "opacity-100"}`}
      />

      {/* Skeleton Loading State */}
      {isInitializing && phase === "SCANNING" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/60 bg-white/20 shadow-cartoon">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <p className="text-h3 text-white drop-shadow-md">
              {t("transfer.initializingCamera")}
            </p>
          </div>
        </div>
      )}

      {/* Floating Top Bar (Idle/Scanning) */}
      {(phase === "SCANNING" || phase === "SCANNED") && (
        <div className="gsap-scanner-item absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4 pt-safe">
          <h1 className="text-h3 text-white drop-shadow-md">
            {t("transfer.title")}
          </h1>
        </div>
      )}

      {/* Scanner Reticle and Controls Group */}
      {(phase === "SCANNING" || phase === "SCANNED") && (
        <div className="pointer-events-none absolute h-[100vh] inset-0 z-10 flex flex-col items-center justify-center -translate-y-8 md:-translate-y-16 overflow-hidden">
          {/* CUSTOM FRIENDLY SCANNING RETICLE */}
          {!isInitializing && !cameraError ? (
            <div className="gsap-scanner-item relative h-[250px] w-[250px] shrink-0 rounded-[32px] shadow-[0_0_0_99999px_rgba(0,0,0,0.7),0_0_20px_rgba(0,0,0,0.3)_inset]">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-pawp-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-pawp-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-pawp-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-pawp-500 rounded-br-xl" />
            </div>
          ) : (
            <div className="gsap-scanner-item h-[250px] w-[250px] shrink-0" />
          )}

          {/* Control Buttons */}
          <div className="gsap-scanner-item pointer-events-auto mt-8 flex w-full items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={() => {
                stopScan();
                setShowManualModal(true);
              }}
              className="flex h-[44px] items-center gap-2 rounded-full border border-white/60 bg-white/40 px-6 text-body font-bold text-white shadow-cartoon backdrop-blur-md transition-all hover:bg-white/50 active:scale-95"
            >
              <Keyboard className="h-5 w-5" />
              <span>{t("transfer.manualInputBtn")}</span>
            </button>

            {isFlashSupported && (
              <button
                type="button"
                onClick={toggleFlash}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/60 bg-white/40 text-white shadow-cartoon backdrop-blur-md transition-all hover:bg-white/50 active:scale-95"
              >
                {isFlashOn ? (
                  <FlashlightOff className="h-5 w-5" />
                ) : (
                  <Flashlight className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Error Overlay */}
      {globalError && phase === "SCANNING" && (
        <div className="absolute inset-x-4 top-24 z-20 rounded-2xl border border-pawp-500/50 bg-black/60 p-4 text-center text-body font-semibold text-pawp-400 backdrop-blur-md shadow-lg">
          <AlertTriangle className="mx-auto mb-1 h-6 w-6" />
          {globalError}
        </div>
      )}

      {cameraError &&
        !isInitializing &&
        phase === "SCANNING" &&
        !showManualModal && (
          <div className="absolute inset-x-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-pawp-500/50 bg-black/80 p-6 text-center text-body font-semibold text-pawp-400 backdrop-blur-md shadow-lg">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
            {cameraError}
          </div>
        )}

      {/* SCANNED SUCCESS OVERLAY */}
      {phase === "SCANNED" && currentReceiver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] border-2 border-white/60 bg-white/20 p-6 shadow-cartoon backdrop-blur-xl">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 ${getAvatarBg(currentReceiver.role, currentReceiver.session, currentReceiver.group)} shadow-hard`}
              >
                <User className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <div className="text-center text-white">
                <h2 className="text-h2 drop-shadow-md">
                  {currentReceiver.firstname} {currentReceiver.lastname}
                </h2>
                <p className="text-body-lg text-white/80">
                  "{currentReceiver.nickname}"
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-caption font-bold text-white shadow-sm">
                  <Users className="h-3 w-3" />
                  {
                    getGroupName(
                      currentReceiver.group,
                      currentReceiver.groupAlt,
                    )?.formatted
                  }
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-caption font-bold text-white shadow-sm">
                  <Star className="h-3 w-3" />
                  {currentReceiver.points.toLocaleString()}{" "}
                  {t("leaderboard.points")}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleScanMore}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-white/60 bg-white/30 px-4 py-3 text-body-lg font-bold text-white transition-all hover:bg-white/40 active:translate-y-0.5 active:shadow-none"
              >
                <Plus className="h-5 w-5" />
                {t("transfer.scanMoreBtn")}
              </button>
              <button
                type="button"
                onClick={handleTransferNow}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-4 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none"
              >
                <Send className="h-5 w-5" />
                {t("transfer.transferNowBtn")}
              </button>
            </div>
            <button
              type="button"
              onClick={resumeScanning}
              className="mt-4 block w-full text-center text-body text-white/60 hover:text-white"
            >
              {t("transfer.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Pill (Bottom) */}
      {(phase === "SCANNING" || phase === "SCANNED") &&
        receivers.length > 0 && (
          <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center p-4">
            <button
              type="button"
              onClick={() => {
                stopScan();
                setShowCartSheet(true);
              }}
              className="flex items-center gap-3 rounded-full border-2 border-white/60 bg-white/40 py-3 pl-4 pr-6 shadow-cartoon backdrop-blur-lg transition-transform hover:scale-105 active:scale-95"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zpd-500 text-white shadow-inner">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pawp-500 text-[10px] font-bold text-white outline outline-2 outline-white">
                  {receivers.length}
                </span>
              </div>
              <span className="text-body-lg font-bold text-zpd-900">
                {t("transfer.batchCartIndicator", { count: receivers.length })}
              </span>
            </button>
          </div>
        )}

      <ManualCodeModal
        isOpen={showManualModal}
        onClose={() => {
          setShowManualModal(false);
          setManualError(null);
          resumeScanning();
        }}
        onSubmit={(code) => lookupUser(code, true)}
        isLookingUp={isLookingUp}
        error={manualError}
      />

      <TransferBottomSheet
        isOpen={showCartSheet}
        onClose={() => {
          setShowCartSheet(false);
          if (phase === "SCANNING") {
            // Need to reset the processed flag to allow camera scanning again
            processedRef.current = false;
          }
        }}
        receivers={receivers}
        onRemoveReceiver={removeReceiver}
        onTransferComplete={handleTransferComplete}
      />

      <ConfirmModal
        isOpen={blocker.state === "blocked"}
        onClose={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
        title={t("modals.navWarningTitle")}
        description={t("modals.navWarningBody")}
        confirmLabel={t("modals.navWarningLeave")}
        cancelLabel={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
}
