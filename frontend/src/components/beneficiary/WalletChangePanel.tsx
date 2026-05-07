import { useState } from "react";
import { getAddress } from "ethers";
import {  CheckCircle2, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { dismissToast, loadingMessage, successMessage, errorMessage } from "@/utils/messageStatus";

interface WalletChangePanelProps {
  currentWallet: string;
  /** Called after a successful confirmWalletChange so the parent can re-fetch */
  onWalletChanged: () => Promise<void>;
  callWriteFunction: (
    name: string,
    args: unknown[],
    gas: bigint
  ) => Promise<{ success: boolean }>;
  estimateGas: (name: string, args: unknown[]) => Promise<bigint | null>;
}

type Step = "idle" | "requested" | "confirmed";

const WalletChangePanel = ({
  currentWallet,
  onWalletChanged,
  callWriteFunction,
  estimateGas,
}: WalletChangePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newWallet, setNewWallet] = useState("");
  const [pendingWallet, setPendingWallet] = useState<string | null>(null); // temp state after request
  const [step, setStep] = useState<Step>("idle");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── validate address ──────────────────────────────────────────────
  const validateAddress = (value: string): string | null => {
    if (!value.trim()) return "Wallet address is required.";
    try {
      getAddress(value.trim());
      return null;
    } catch {
      return "Invalid EVM wallet address.";
    }
  };

  // ── step 1: requestWalletChange ───────────────────────────────────
  const handleRequest = async () => {
    const err = validateAddress(newWallet);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);

    const checksummed = getAddress(newWallet.trim()) as `0x${string}`;
    const toastId = loadingMessage("Estimating gas for wallet change request...");
    setIsRequesting(true);

    try {
      const gas = await estimateGas("requestWalletChange", [checksummed]);
      if (!gas) {
        dismissToast(toastId);
        return;
      }

      loadingMessage("Submitting wallet change request...");
      const { success } = await callWriteFunction(
        "requestWalletChange",
        [checksummed],
        gas
      );

      dismissToast(toastId);

      if (success) {
        successMessage("Wallet change requested. Now confirm to apply it.");
        setPendingWallet(checksummed); // store for confirm step
        setStep("requested");
      }
    } catch {
      dismissToast(toastId);
      errorMessage("Failed to request wallet change.");
    } finally {
      setIsRequesting(false);
    }
  };

  // ── step 2: confirmWalletChange ───────────────────────────────────
  const handleConfirm = async () => {
    if (!pendingWallet) return;

    const toastId = loadingMessage("Estimating gas for wallet change confirmation...");
    setIsConfirming(true);

    try {
      const gas = await estimateGas("confirmWalletChange", []);
      if (!gas) {
        dismissToast(toastId);
        return;
      }

      loadingMessage("Confirming wallet change on-chain...");
      const { success } = await callWriteFunction("confirmWalletChange", [], gas);

      dismissToast(toastId);

      if (success) {
        successMessage("Wallet address updated successfully.");
        setStep("confirmed");
        setPendingWallet(null);
        setNewWallet("");
        await onWalletChanged(); // re-fetch parent data
      }
    } catch {
      dismissToast(toastId);
      errorMessage("Failed to confirm wallet change.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setStep("idle");
    setPendingWallet(null);
    setNewWallet("");
    setValidationError(null);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* accordion header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <RefreshCw className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Change Registered Wallet
            </p>
            <p className="text-xs text-slate-500">
              Optional — only if you no longer control the registered address
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* accordion body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-5 space-y-4">
          {step === "idle" && (
            <>
              <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-700">
                <p className="font-semibold">Current registered address</p>
                <p className="mt-1 font-mono break-all">{currentWallet}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  New Wallet Address
                </label>
                <input
                  type="text"
                  value={newWallet}
                  onChange={(e) => {
                    setNewWallet(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="0x..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                {validationError && (
                  <p className="text-xs text-rose-600 mt-1">{validationError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleRequest()}
                disabled={isRequesting || !newWallet.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRequesting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</>
                ) : (
                  "Step 1 — Request Wallet Change"
                )}
              </button>
            </>
          )}

          {step === "requested" && pendingWallet && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Change requested</p>
                  <p className="mt-1 text-xs text-emerald-600 font-mono break-all">
                    Pending: {pendingWallet}
                  </p>
                  <p className="mt-2 text-xs">
                    Now submit the confirmation transaction to apply the change on-chain.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={isConfirming}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isConfirming ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
                  ) : (
                    "Step 2 — Confirm Wallet Change"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "confirmed" && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Wallet address updated successfully. Reconnect with your new wallet to claim.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletChangePanel;