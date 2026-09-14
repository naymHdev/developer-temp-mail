"use client";

import React from "react";
import { AlertCircle, Timer, ZapOff, CheckCircle2 } from "lucide-react";

interface RateLimitBannerProps {
  remainingSeconds: number;
  totalSeconds?: number;
  onDismiss?: () => void;
}

export function RateLimitBanner({
  remainingSeconds,
  totalSeconds = 30,
}: RateLimitBannerProps) {
  if (remainingSeconds <= 0) return null;

  const percentage = Math.max(
    0,
    Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100))
  );

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-[#141622] p-4 sm:p-5 backdrop-blur-2xl shadow-2xl shadow-amber-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Icon & Warning description */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 shadow-inner">
            <Timer className="h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                API Rate Limit Active
              </h4>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                Mail.tm Safety Guard
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Third-party provider cooldown is active to prevent IP throttling.
            </p>
          </div>
        </div>

        {/* Right Side: Visual Countdown & Progress Ring/Bar */}
        <div className="flex items-center gap-3 sm:self-auto self-end">
          <div className="flex flex-col items-end gap-1 min-w-[120px]">
            <div className="flex items-baseline gap-1 text-xs">
              <span className="text-slate-400">Ready in:</span>
              <span className="font-mono text-base font-black text-amber-400 animate-pulse">
                {remainingSeconds}s
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000 ease-linear"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
