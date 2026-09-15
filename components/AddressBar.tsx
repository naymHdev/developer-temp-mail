"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Loader2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddressBarProps {
  address: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  countdown: number;
  soundEnabled: boolean;
  rateLimitRemaining?: number;
  onRefresh: () => void;
  onGenerateNew: () => void;
  onOpenCustomModal: () => void;
  onDeleteMailbox: () => void;
  onToggleSound: () => void;
}

export function AddressBar({
  address,
  isLoading,
  isRefreshing,
  countdown,
  soundEnabled,
  rateLimitRemaining = 0,
  onRefresh,
  onGenerateNew,
  onOpenCustomModal,
  onDeleteMailbox,
  onToggleSound,
}: AddressBarProps) {
  const [copied, setCopied] = useState(false);
  const isRateLimited = rateLimitRemaining > 0;

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Email copied to clipboard!", {
        description: address,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email");
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-[#141622]/95 p-3.5 sm:p-5 lg:p-6 backdrop-blur-2xl border border-slate-800/40 space-y-3 sm:space-y-4">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
            Disposable Test Mailbox
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        {isRateLimited && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
            <Timer className="h-3 w-3" />
            Cooldown ({rateLimitRemaining}s)
          </span>
        )}
      </div>

      {/* Main Email Address Display & Copy Button */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-[#0b0c12]/95 p-2 sm:p-2.5 pl-3 sm:pl-4 shadow-inner border border-slate-800/60">
        <div className="flex-1 min-w-0 pr-1">
          {isLoading ? (
            <div className="flex items-center gap-2 py-1 text-xs sm:text-sm text-slate-400">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-amber-400 shrink-0" />
              <span className="truncate">Generating temporary mailbox...</span>
            </div>
          ) : (
            <div className="font-mono text-sm sm:text-base lg:text-lg font-bold text-amber-200 tracking-tight select-all truncate">
              {address || "No active mailbox"}
            </div>
          )}
        </div>

        <Button
          variant={copied ? "default" : "glow"}
          size="sm"
          onClick={handleCopy}
          disabled={!address || isLoading}
          className="h-9 sm:h-10 shrink-0 gap-1.5 px-3 sm:px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Action Buttons Toolbar - Fully Mobile Responsive */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2 pt-0.5">
        {/* Left Actions: Refresh & Sound */}
        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading || !address || isRateLimited}
            className="flex-1 sm:flex-none h-9 sm:h-10 gap-1.5 px-3 text-xs font-mono rounded-xl bg-[#1c1e2e] text-slate-200 hover:bg-[#25283c] border-slate-800 shadow-sm"
            title="Manual Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-amber-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({countdown}s)
            </span>
          </Button>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onToggleSound}
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#1c1e2e] border border-slate-800 shrink-0 ${
              soundEnabled
                ? "text-amber-400 hover:bg-[#25283c]"
                : "text-slate-500 hover:bg-[#25283c] hover:text-slate-400"
            } shadow-sm`}
            title={soundEnabled ? "Sound Alert On" : "Sound Alert Off"}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>

        {/* Right Actions: Custom Prefix, New Mailbox, Delete */}
        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomModal}
            disabled={isLoading || isRateLimited}
            className="flex-1 sm:flex-none h-9 sm:h-10 gap-1.5 px-2.5 sm:px-3.5 text-xs rounded-xl bg-[#1c1e2e] text-slate-200 hover:bg-[#25283c] border-slate-800 shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span>Custom</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onGenerateNew}
            disabled={isLoading || isRateLimited}
            className="flex-1 sm:flex-none h-9 sm:h-10 gap-1.5 px-3 sm:px-4 text-xs font-semibold rounded-xl bg-[#23263b] text-slate-100 hover:bg-[#2e324d] border border-slate-700/60 shadow-sm"
          >
            {isRateLimited ? (
              <>
                <Timer className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span>Wait ({rateLimitRemaining}s)</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 text-sky-400" />
                <span>New</span>
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="iconSm"
            onClick={onDeleteMailbox}
            disabled={isLoading || !address}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 shrink-0 shadow-sm"
            title="Delete Mailbox"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
