"use client";

import React from "react";
import { Terminal, Code2, Webhook, Keyboard, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenApiModal: () => void;
  onOpenWebhookModal: () => void;
  onOpenShortcutsModal: () => void;
  isWebhookEnabled?: boolean;
  isNotificationEnabled?: boolean;
  onToggleNotification?: () => void;
  onScrollToHealth?: () => void;
}

export function Navbar({
  onOpenApiModal,
  onOpenWebhookModal,
  onOpenShortcutsModal,
  isWebhookEnabled = false,
  isNotificationEnabled = false,
  onToggleNotification,
  onScrollToHealth,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0e14]/85 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Fancy Brand Typography */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-[26px] font-black tracking-tight leading-none bg-gradient-to-r from-amber-400 via-amber-200 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]">
                DTMail
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300/90 shadow-sm">
                beta
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wider text-slate-400 uppercase font-sans">
                <span className="text-amber-400 font-bold">D</span>ev{" "}
                <span className="text-amber-400 font-bold">T</span>emp{" "}
                <span className="text-amber-400 font-bold">M</span>ail
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation & Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Notification Toggle */}
          {onToggleNotification && (
            <button
              onClick={onToggleNotification}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all cursor-pointer shadow-md shadow-black/30 ${
                isNotificationEnabled
                  ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30"
                  : "bg-[#161824] text-slate-400 hover:bg-[#1f2233] hover:text-slate-200"
              }`}
              title={
                isNotificationEnabled
                  ? "Desktop Push Notifications: ON"
                  : "Enable Desktop Push Notifications"
              }
            >
              {isNotificationEnabled ? (
                <Bell className="h-4 w-4 text-amber-400" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Local Webhook Relay Trigger */}
          <button
            onClick={onOpenWebhookModal}
            className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs transition-all cursor-pointer shadow-md shadow-black/30 ${
              isWebhookEnabled
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30"
                : "bg-[#161824] text-slate-300 hover:bg-[#1f2233]"
            }`}
            title="Configure Local Webhook Relay"
          >
            <Webhook
              className={`h-3.5 w-3.5 ${
                isWebhookEnabled ? "text-amber-400 animate-pulse" : "text-slate-400"
              }`}
            />
            <span className="hidden sm:inline font-mono font-medium text-[11px]">
              Webhook {isWebhookEnabled ? "ON" : "Relay"}
            </span>
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcutsModal}
            className="flex h-9 items-center gap-1.5 rounded-2xl bg-[#161824] px-2.5 text-xs text-slate-300 transition-all hover:bg-[#1f2233] shadow-md shadow-black/30 cursor-pointer"
            title="Keyboard Shortcuts (Press ?)"
          >
            <Keyboard className="h-3.5 w-3.5 text-amber-400" />
            <kbd className="hidden md:inline font-mono text-[10px] text-slate-400 bg-[#0b0c12] px-1.5 py-0.5 rounded">
              ?
            </kbd>
          </button>

          {onScrollToHealth && (
            <button
              onClick={onScrollToHealth}
              className="hidden lg:flex items-center gap-2 rounded-2xl bg-[#161824] px-3.5 py-1.5 text-xs text-slate-300 transition-all hover:bg-[#1f2233] shadow-md shadow-black/30 cursor-pointer"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-emerald-400">API Health 99.9%</span>
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenApiModal}
            className="flex items-center gap-1.5 text-xs font-mono rounded-xl bg-[#161824] hover:bg-[#1f2233] text-slate-200 shadow-md shadow-black/30"
          >
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            <span>API Docs</span>
          </Button>

          <a
            href="https://github.com/naymHdev/developer-temp-mail"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="iconSm"
              className="rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#1a1d2e]"
              title="GitHub Source"
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
