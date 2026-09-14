"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AtSign } from "lucide-react";

interface CustomMailboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (prefix: string) => Promise<void>;
}

export function CustomMailboxModal({
  open,
  onOpenChange,
  onSubmit,
}: CustomMailboxModalProps) {
  const [prefix, setPrefix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(prefix.trim());
      setPrefix("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>Custom Mailbox Prefix</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Specify a custom username prefix for your disposable test inbox (e.g.{" "}
              <span className="font-mono text-amber-300 font-semibold">signup_qa</span>,{" "}
              <span className="font-mono text-amber-300 font-semibold">dev_test</span>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Username Prefix
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/80" />
              <input
                placeholder="e.g. test_user"
                value={prefix}
                onChange={(e) =>
                  setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))
                }
                maxLength={20}
                autoFocus
                className="h-11 w-full rounded-2xl bg-[#0b0c12]/90 pl-10 pr-4 font-mono text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400/60"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Allowed characters: lowercase letters, numbers, underscores, and dashes.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl bg-[#1c1e2e] text-slate-300 hover:bg-[#25283c] hover:text-slate-100 shadow-md shadow-black/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!prefix.trim() || isSubmitting}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Generate Mailbox</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
