"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Command, Sparkles } from "lucide-react";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  key: string;
  label: string;
  category: "General" | "Navigation" | "Actions";
}

const SHORTCUTS: ShortcutItem[] = [
  { key: "C", label: "Copy active disposable email address", category: "Actions" },
  { key: "O", label: "Copy detected OTP code from selected email", category: "Actions" },
  { key: "R", label: "Manual refresh active inbox", category: "Actions" },
  { key: "N", label: "Generate & activate a new inbox", category: "Actions" },
  { key: "P", label: "Open custom prefix mailbox modal", category: "Actions" },
  { key: "W", label: "Open Local Webhook Relay modal", category: "General" },
  { key: "J / ↓", label: "Select next email in inbox list", category: "Navigation" },
  { key: "K / ↑", label: "Select previous email in inbox list", category: "Navigation" },
  { key: "D", label: "Delete currently opened email", category: "Actions" },
  { key: "?", label: "Toggle this Keyboard Shortcuts cheatsheet", category: "General" },
];

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <DialogTitle>Developer Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Press any of the following keys anywhere outside text inputs for lightning-fast testing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl bg-[#0b0c12]/90 px-4 py-2.5 text-xs shadow-inner"
            >
              <span className="text-slate-300 font-medium">{item.label}</span>
              <kbd className="inline-flex items-center justify-center rounded-lg bg-[#1f2233] px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300 shadow-md shadow-black/40 ring-1 ring-amber-500/20">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-[#141622] p-3 text-[11px] text-slate-400 shadow-inner mt-2">
          <Command className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Shortcuts are automatically disabled when typing in modal inputs.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
