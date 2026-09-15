"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Code2,
  Webhook,
  Keyboard,
  Bell,
  BellOff,
  Menu,
  X,
  Activity,
} from "lucide-react";
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
  const [activeDevs, setActiveDevs] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleActiveUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      if (typeof customEvent.detail?.count === "number") {
        setActiveDevs(customEvent.detail.count);
      }
    };

    window.addEventListener("dtm_active_users_update", handleActiveUpdate);
    return () => {
      window.removeEventListener("dtm_active_users_update", handleActiveUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0e14]/90 backdrop-blur-xl border-b border-slate-800/40 shadow-lg shadow-black/40">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Fancy Brand Typography */}
        <div className="flex items-center gap-2 sm:gap-3 select-none">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-amber-400 via-amber-200 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]">
                DTMail
              </span>
              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-semibold text-amber-300/90 shadow-sm">
                beta
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase font-sans">
                <span className="text-amber-400 font-bold">D</span>ev{" "}
                <span className="text-amber-400 font-bold">T</span>emp{" "}
                <span className="text-amber-400 font-bold">M</span>ail
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Online Users Badge */}
          <button
            onClick={onScrollToHealth}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-[#161824] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-slate-300 transition-all hover:bg-[#1f2233] shadow-md shadow-black/30 cursor-pointer border border-emerald-500/20"
            title={`${activeDevs} developer(s) currently active on DTMail`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono font-medium text-[10px] sm:text-[11px] text-emerald-400">
              {activeDevs} <span className="hidden xs:inline">{activeDevs === 1 ? "dev" : "devs"}</span> online
            </span>
          </button>

          {/* Desktop Notification Toggle (Always visible) */}
          {onToggleNotification && (
            <button
              onClick={onToggleNotification}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-md shadow-black/30 ${
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
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
              ) : (
                <BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
          )}

          {/* Desktop-only Action items */}
          <div className="hidden md:flex items-center gap-2">
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
              <span className="font-mono font-medium text-[11px]">
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
              <kbd className="font-mono text-[10px] text-slate-400 bg-[#0b0c12] px-1.5 py-0.5 rounded">
                ?
              </kbd>
            </button>

            {/* API Docs Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenApiModal}
              className="flex items-center gap-1.5 text-xs font-mono rounded-xl bg-[#161824] hover:bg-[#1f2233] text-slate-200 shadow-md shadow-black/30"
            >
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>API Docs</span>
            </Button>

            {/* GitHub Link */}
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

          {/* Mobile Menu Toggle Button (< md) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl bg-[#161824] text-slate-300 hover:bg-[#1f2233] shadow-md shadow-black/30 transition-all"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-amber-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slideout Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/60 bg-[#0d0e14]/98 p-4 backdrop-blur-2xl shadow-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenApiModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#161824] p-2.5 text-xs text-slate-200 hover:bg-[#1f2233] border border-slate-800"
            >
              <Terminal className="h-4 w-4 text-amber-400" />
              <span className="font-mono">API Docs</span>
            </button>

            <button
              onClick={() => {
                onOpenWebhookModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#161824] p-2.5 text-xs text-slate-200 hover:bg-[#1f2233] border border-slate-800"
            >
              <Webhook className="h-4 w-4 text-sky-400" />
              <span>Webhook Relay</span>
            </button>

            <button
              onClick={() => {
                onOpenShortcutsModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#161824] p-2.5 text-xs text-slate-200 hover:bg-[#1f2233] border border-slate-800"
            >
              <Keyboard className="h-4 w-4 text-purple-400" />
              <span>Shortcuts</span>
            </button>

            <button
              onClick={() => {
                if (onScrollToHealth) onScrollToHealth();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#161824] p-2.5 text-xs text-slate-200 hover:bg-[#1f2233] border border-slate-800"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Platform Health</span>
            </button>
          </div>

          <div className="pt-1">
            <a
              href="https://github.com/naymHdev/developer-temp-mail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#161824] py-2 text-xs text-slate-300 hover:bg-[#1f2233]"
            >
              <Code2 className="h-4 w-4 text-amber-400" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
