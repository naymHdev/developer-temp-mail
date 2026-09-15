"use client";

import React from "react";
import { Plus, X, Layers, SlidersHorizontal, Timer } from "lucide-react";
import { StoredMailbox } from "@/types/mailtm";
import { Button } from "@/components/ui/button";

interface MailboxSwitcherProps {
  mailboxes: StoredMailbox[];
  activeAddress: string | null;
  rateLimitRemaining?: number;
  onSelectMailbox: (address: string) => void;
  onAddRandom: () => void;
  onOpenCustomModal: () => void;
  onRemoveMailbox: (address: string, e: React.MouseEvent) => void;
  isCreating: boolean;
}

export function MailboxSwitcher({
  mailboxes,
  activeAddress,
  rateLimitRemaining = 0,
  onSelectMailbox,
  onAddRandom,
  onOpenCustomModal,
  onRemoveMailbox,
  isCreating,
}: MailboxSwitcherProps) {
  const isRateLimited = rateLimitRemaining > 0;

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-[#141622]/90 p-3 sm:p-4 backdrop-blur-xl border border-slate-800/40 space-y-2.5">
      {/* Header & Actions */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Left Side: Workspaces Counter */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400">
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-200">Workspaces</span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
              {mailboxes.length} {mailboxes.length === 1 ? "Inbox" : "Inboxes"}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Add */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomModal}
            disabled={isCreating || isRateLimited}
            className="h-7 sm:h-8 gap-1 px-2 sm:px-2.5 text-xs rounded-xl bg-[#1c1e2e] text-slate-300 hover:bg-[#25283c] border-slate-800"
            title="Custom Prefix"
          >
            <SlidersHorizontal className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">Custom</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onAddRandom}
            disabled={isCreating || isRateLimited}
            className="h-7 sm:h-8 gap-1 px-2.5 sm:px-3 text-xs rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20 font-semibold"
          >
            {isRateLimited ? (
              <>
                <Timer className="h-3 w-3 animate-spin" />
                <span>({rateLimitRemaining}s)</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>
                  Add <span className="hidden sm:inline">New Inbox</span>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Scrollable Mailbox Pills with Touch Support */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 touch-pan-x sleek-scroll">
        {mailboxes.map((mb) => {
          const isActive = mb.address === activeAddress;
          const [prefix, domain] = mb.address.split("@");

          return (
            <div
              key={mb.address}
              onClick={() => onSelectMailbox(mb.address)}
              className={`group relative flex items-center gap-2 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:py-2 text-xs transition-all cursor-pointer select-none shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-[#25283d] to-[#1e2133] text-amber-200 shadow-md shadow-black/40 ring-1 ring-amber-500/40"
                  : "bg-[#0b0c12]/80 text-slate-400 hover:bg-[#1b1e2e] hover:text-slate-200 border border-slate-800/40"
              }`}
            >
              {/* Active Indicator */}
              <div className="flex items-center gap-1">
                {isActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
              </div>

              {/* Address label */}
              <div className="flex items-center gap-1 font-mono">
                <span
                  className={`font-semibold max-w-[100px] sm:max-w-[130px] truncate ${
                    isActive ? "text-amber-300" : "text-slate-300"
                  }`}
                >
                  {prefix}
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  @{domain}
                </span>
              </div>

              {/* Unread Badge */}
              {typeof mb.unreadCount === "number" && mb.unreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[9px] font-bold text-slate-950 shadow-sm animate-pulse">
                  {mb.unreadCount}
                </span>
              )}

              {/* Remove button */}
              {mailboxes.length > 1 && (
                <button
                  onClick={(e) => onRemoveMailbox(mb.address, e)}
                  className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-0.5"
                  title="Remove this mailbox"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
