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
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AddressBarProps {
  address: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  countdown: number;
  soundEnabled: boolean;
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
  onRefresh,
  onGenerateNew,
  onOpenCustomModal,
  onDeleteMailbox,
  onToggleSound,
}: AddressBarProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl shadow-black/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Address info & Primary Action */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Disposable Test Inbox
            </span>
            <Badge variant="live" className="text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Polling
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[240px] items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 shadow-inner">
              {isLoading ? (
                <div className="flex items-center gap-2 py-0.5 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  <span>Provisioning developer mailbox...</span>
                </div>
              ) : (
                <span className="font-mono text-sm sm:text-base font-semibold text-sky-300 tracking-tight select-all truncate">
                  {address || "No active mailbox"}
                </span>
              )}

              <Button
                variant={copied ? "default" : "glow"}
                size="sm"
                onClick={handleCopy}
                disabled={!address || isLoading}
                className="h-8 gap-1.5 px-3 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 lg:border-t-0 lg:pt-0">
          {/* Polling Timer & Manual Refresh */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading || !address}
              className="h-9 gap-1.5 px-3 text-xs font-mono text-slate-300"
              title="Manual Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-sky-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
              <span className="text-[11px] text-slate-500">({countdown}s)</span>
            </Button>

            <Button
              variant="ghost"
              size="iconSm"
              onClick={onToggleSound}
              className={`h-9 w-9 ${
                soundEnabled
                  ? "text-sky-400 hover:bg-sky-500/10"
                  : "text-slate-500 hover:text-slate-400"
              }`}
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
              disabled={isLoading}
              className="h-9 gap-1.5 text-xs text-slate-300"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Custom Prefix</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onGenerateNew}
              disabled={isLoading}
              className="h-9 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5 text-sky-400" />
              <span>New</span>
            </Button>

            <Button
              variant="destructive"
              size="iconSm"
              onClick={onDeleteMailbox}
              disabled={isLoading || !address}
              className="h-9 w-9"
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
