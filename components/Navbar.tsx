"use client";

import React from "react";
import { Mail, Terminal, Code2, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenApiModal: () => void;
}

export function Navbar({ onOpenApiModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
            <Mail className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-100">
              DevTempMail
            </span>
            <Badge variant="secondary" className="font-mono text-[10px] text-sky-400 border-sky-500/30">
              v1.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 text-xs text-slate-400 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero-Cost Serverless</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenApiModal}
            className="flex items-center gap-1.5 text-xs font-mono"
          >
            <Terminal className="h-3.5 w-3.5 text-sky-400" />
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
              className="text-slate-400 hover:text-slate-100"
              title="GitHub Repository"
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
