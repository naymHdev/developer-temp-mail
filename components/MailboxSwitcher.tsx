"use client";

import React from "react";
import {
  Plus,
  X,
  Layers,
  SlidersHorizontal,
  Timer,
} from "lucide-react";
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
    <div className="w-full rounded-3xl bg-[#141622]/90 p-3 sm:p-4 backdrop-blur-xl shadow-xl shadow-black/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Header & Counter */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">
              Active Workspaces
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
              {mailboxes.length} {mailboxes.length === 1 ? "Inbox" : "Inboxes"}
            </span>
            {isRateLimited && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
                <Timer className="h-3 w-3" />
                Cooldown {rateLimitRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Quick Add Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomModal}
            disabled={isCreating || isRateLimited}
            className="h-8 gap-1.5 px-3 text-xs rounded-xl bg-[#1c1e2e] text-slate-300 hover:bg-[#25283c] hover:text-slate-100 shadow-sm"
          >
            <SlidersHorizontal className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">Custom Prefix</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onAddRandom}
            disabled={isCreating || isRateLimited}
            className="h-8 gap-1.5 px-3 text-xs rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 hover:bg-amber-500/30 shadow-sm font-semibold"
          >
            {isRateLimited ? (
              <>
                <Timer className="h-3.5 w-3.5 animate-spin" />
                <span>Cooldown ({rateLimitRemaining}s)</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Inbox</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Scrollable Mailbox Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-thin">
        {mailboxes.map((mb) => {
          const isActive = mb.address === activeAddress;
          const [prefix, domain] = mb.address.split("@");

          return (
            <div
              key={mb.address}
              onClick={() => onSelectMailbox(mb.address)}
              className={`group relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs transition-all cursor-pointer select-none shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-[#25283d] to-[#1e2133] text-amber-200 shadow-lg shadow-black/40 ring-1 ring-amber-500/30"
                  : "bg-[#0b0c12]/80 text-slate-400 hover:bg-[#1b1e2e] hover:text-slate-200 shadow-inner"
              }`}
            >
              {/* Active Indicator */}
              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
              </div>

              {/* Address label */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-mono font-semibold max-w-[140px] truncate ${
                      isActive ? "text-amber-300" : "text-slate-200"
                    }`}
                  >
                    {prefix}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    @{domain}
                  </span>
                </div>
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
                  className="flex h-5 w-5 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-1"
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
