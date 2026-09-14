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
    <div className="w-full rounded-3xl bg-[#141622]/95 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-black/60 warm-card-hover">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Address info & Primary Action */}
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Disposable Test Mailbox
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Inbound Sync
            </span>
            {isRateLimited && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
                <Timer className="h-3 w-3" />
                Rate Limited ({rateLimitRemaining}s)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[240px] items-center justify-between gap-3 rounded-2xl bg-[#0b0c12]/90 px-4 py-3 shadow-inner">
              {isLoading ? (
                <div className="flex items-center gap-2 py-0.5 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Generating temporary mailbox...</span>
                </div>
              ) : (
                <span className="font-mono text-base sm:text-lg font-bold text-amber-200 tracking-tight select-all truncate">
                  {address || "No active mailbox"}
                </span>
              )}

              <Button
                variant={copied ? "default" : "glow"}
                size="sm"
                onClick={handleCopy}
                disabled={!address || isLoading}
                className="h-9 gap-1.5 px-4 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20"
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
          </div>
        </div>

        {/* Right Side: Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 lg:pt-0">
          {/* Polling Timer & Manual Refresh */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading || !address || isRateLimited}
              className="h-10 gap-1.5 px-3.5 text-xs font-mono rounded-xl bg-[#1c1e2e] text-slate-200 hover:bg-[#25283c] shadow-md shadow-black/20"
              title="Manual Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-amber-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
              <span className="text-[11px] text-slate-400">({countdown}s)</span>
            </Button>

            <Button
              variant="ghost"
              size="iconSm"
              onClick={onToggleSound}
              className={`h-10 w-10 rounded-xl bg-[#1c1e2e] ${
                soundEnabled
                  ? "text-amber-400 hover:bg-[#25283c]"
                  : "text-slate-500 hover:bg-[#25283c] hover:text-slate-400"
              } shadow-md shadow-black/20`}
              title={soundEnabled ? "Sound Alert On" : "Sound Alert Off"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCustomModal}
              disabled={isLoading || isRateLimited}
              className="h-10 gap-1.5 text-xs rounded-xl bg-[#1c1e2e] text-slate-200 hover:bg-[#25283c] shadow-md shadow-black/20"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span>Custom Prefix</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onGenerateNew}
              disabled={isLoading || isRateLimited}
              className="h-10 gap-1.5 text-xs rounded-xl bg-[#23263b] text-slate-100 hover:bg-[#2e324d] shadow-md shadow-black/20"
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
              className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-md shadow-black/20"
              title="Delete Mailbox"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
