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
  Sparkles,
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
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header & Search */}
      <div className="flex flex-col gap-2.5 border-b border-slate-800/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Inbox</h2>
            <Badge variant="secondary" className="font-mono text-xs">
              {messages.length}
            </Badge>
          </div>
          {messages.length > 0 && (
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-sync active
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Search sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-950/70 border-slate-800"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col gap-2 rounded-lg border border-slate-800/40 bg-slate-950/40 p-3 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-28 bg-slate-800 rounded" />
                  <div className="h-2 w-12 bg-slate-800 rounded" />
                </div>
                <div className="h-3.5 w-3/4 bg-slate-800 rounded" />
                <div className="h-2.5 w-full bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex h-full min-h-[340px] flex-col items-center justify-center p-6 text-center">
            {searchQuery ? (
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400">No emails match &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Radar animation container */}
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute h-16 w-16 rounded-full bg-sky-500/10 animate-radar" />
                  <div className="absolute h-12 w-12 rounded-full bg-sky-500/15" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 border border-sky-500/40 shadow-lg shadow-sky-500/10">
                    <Radio className="h-5 w-5 text-sky-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Waiting for emails...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                    Send a test email to your temporary address above to see it appear here instantly.
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
                className={`group relative flex cursor-pointer flex-col gap-1.5 p-3.5 transition-all text-left ${
                  isSelected
                    ? "bg-slate-800/90 border-l-2 border-l-sky-400 shadow-sm"
                    : "hover:bg-slate-800/40 border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {!msg.seen && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                    )}
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-sky-300" : "text-slate-200"
                      }`}
                    >
                      {msg.from.name || msg.from.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500">
                    {msg.hasAttachments && (
                      <Paperclip className="h-3 w-3 text-slate-400" />
                    )}
                    <span>{formatDate(msg.createdAt)}</span>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={(e) => onDeleteMessage(msg.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-opacity ml-1"
                      title="Delete email"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <h4
                  className={`text-xs font-medium line-clamp-1 ${
                    isSelected ? "text-slate-100" : "text-slate-300"
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
