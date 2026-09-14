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
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <span>Create Custom Mailbox</span>
            </DialogTitle>
            <DialogDescription>
              Specify a custom username prefix for your temporary email (e.g.{" "}
              <code className="text-sky-300 font-mono">user_signup</code>,{" "}
              <code className="text-sky-300 font-mono">qa_test</code>).
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Username Prefix
            </label>
            <div className="relative">
              <Input
                placeholder="e.g. test_user"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                maxLength={20}
                autoFocus
                className="font-mono text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Letters, numbers, underscores, dashes, and periods only.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={!prefix.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Generate Address</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
