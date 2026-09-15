"use client";

import React, { useState } from "react";
import {
  Mail,
  Paperclip,
  Search,
  Inbox,
  Clock,
  Trash2,
  Radio,
} from "lucide-react";
import { MailTmMiniMessage } from "@/types/mailtm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface InboxListProps {
  messages: MailTmMiniMessage[];
  selectedMessageId: string | null;
  isLoading: boolean;
  onSelectMessage: (id: string) => void;
  onDeleteMessage: (id: string, e: React.MouseEvent) => void;
}

export function InboxList({
  messages,
  selectedMessageId,
  isLoading,
  onSelectMessage,
  onDeleteMessage,
}: InboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase();
    return (
      msg.subject.toLowerCase().includes(q) ||
      msg.from.name.toLowerCase().includes(q) ||
      msg.from.address.toLowerCase().includes(q) ||
      msg.intro.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#141622]/95 backdrop-blur-2xl overflow-hidden border border-slate-800/40">
      {/* Header & Search */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">Live Inbox</h2>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
              {messages.length}
            </span>
          </div>
          {messages.length > 0 && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sync active
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-2xl bg-[#0b0c12]/90 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col gap-2.5 p-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col gap-2 rounded-2xl bg-[#1b1d2c]/60 p-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-28 bg-slate-800 rounded-full" />
                  <div className="h-2 w-12 bg-slate-800 rounded-full" />
                </div>
                <div className="h-3.5 w-3/4 bg-slate-800 rounded-full" />
                <div className="h-2.5 w-full bg-slate-800/60 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex h-full min-h-[340px] flex-col items-center justify-center p-6 text-center">
            {searchQuery ? (
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400">
                  No emails match &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Radar animation container */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <div className="absolute h-20 w-20 rounded-full bg-amber-500/10 animate-radar" />
                  <div className="absolute h-14 w-14 rounded-full bg-amber-500/15" />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1d2c] shadow-xl shadow-amber-500/10">
                    <Radio className="h-5 w-5 text-amber-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100">
                    Waiting for inbound emails...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                    Send a test email to your temporary address above to see it
                    appear here instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                className={`group relative flex cursor-pointer flex-col gap-1.5 p-4 transition-all rounded-2xl text-left ${
                  isSelected
                    ? "bg-[#23263b] shadow-xl shadow-black/40 text-slate-100"
                    : "bg-[#181a27]/60 hover:bg-[#1f2233] text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {!msg.seen && (
                      <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    )}
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? "text-amber-300" : "text-slate-200"
                      }`}
                    >
                      {msg.from.name || msg.from.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-400">
                    {msg.hasAttachments && (
                      <Paperclip className="h-3 w-3 text-amber-400" />
                    )}
                    <span>{formatDate(msg.createdAt)}</span>
                    <button
                      onClick={(e) => onDeleteMessage(msg.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center ml-1"
                      title="Delete email"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? "text-slate-100" : "text-slate-200"
                  }`}
                >
                  {msg.subject || "(No Subject)"}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {msg.intro || "No preview content available."}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
