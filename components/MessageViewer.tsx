"use client";

import React, { useState, useMemo } from "react";
import {
  Mail,
  Trash2,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  Code,
  FileText,
  Eye,
  Download,
  Terminal,
  Paperclip,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import DOMPurify from "dompurify";
import { MailTmFullMessage } from "@/types/mailtm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { extractOtpAndLinks } from "@/lib/extractor";
import { formatFullDate } from "@/lib/utils";
import { toast } from "sonner";

interface MessageViewerProps {
  message: MailTmFullMessage | null;
  isLoading: boolean;
  onDeleteMessage: (id: string) => void;
  onBackToList?: () => void;
}

export function MessageViewer({
  message,
  isLoading,
  onDeleteMessage,
  onBackToList,
}: MessageViewerProps) {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Extract OTP & Magic Links
  const extracted = useMemo(() => {
    if (!message) return { otpCode: null, magicLinks: [], trackingUrls: [] };
    const htmlFirst = Array.isArray(message.html) ? message.html.join(" ") : "";
    return extractOtpAndLinks(message.subject, message.text, htmlFirst);
  }, [message]);

  // Sanitize HTML
  const sanitizedHtml = useMemo(() => {
    if (!message || !message.html || message.html.length === 0) return null;
    const rawHtml = message.html.join("");
    if (typeof window !== "undefined") {
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ["target"],
      });
    }
    return rawHtml;
  }, [message]);

  const handleCopyOtp = async () => {
    if (!extracted.otpCode) return;
    try {
      await navigator.clipboard.writeText(extracted.otpCode);
      setCopiedOtp(true);
      toast.success(`OTP Code copied: ${extracted.otpCode}`);
      setTimeout(() => setCopiedOtp(false), 2000);
    } catch {
      toast.error("Failed to copy OTP");
    }
  };

  const handleCopyJson = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(message, null, 2));
      setCopiedJson(true);
      toast.success("Message JSON copied to clipboard");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const curlSnippet = useMemo(() => {
    if (!message) return "";
    return `curl -X GET "https://api.mail.tm/messages/${message.id}" \\\n  -H "Authorization: Bearer <YOUR_SESSION_JWT>" \\\n  -H "Accept: application/json"`;
  }, [message]);

  const handleCopyCurl = async () => {
    if (!curlSnippet) return;
    try {
      await navigator.clipboard.writeText(curlSnippet);
      setCopiedCurl(true);
      toast.success("cURL command copied to clipboard");
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      toast.error("Failed to copy cURL");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[380px] lg:min-h-[480px] items-center justify-center rounded-2xl sm:rounded-3xl bg-[#141622]/95 backdrop-blur-2xl p-6 sm:p-8 border border-slate-800/40">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono">
            Fetching full email content...
          </span>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex h-full min-h-[380px] lg:min-h-[480px] flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-[#141622]/90 backdrop-blur-2xl p-6 sm:p-8 text-center border border-slate-800/40">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#1b1e2e] text-amber-400/80 shadow-inner mb-3">
          <Mail className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-100">
          No message selected
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
          Select an email from the inbox list to read its contents, extract OTP
          codes, and inspect developer headers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl sm:rounded-3xl bg-[#141622]/95 backdrop-blur-2xl overflow-hidden border border-slate-800/40">
      {/* Email Header */}
      <div className="flex flex-col gap-3 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-800/50">
        {/* Mobile Back Button & Delete Action */}
        <div className="flex items-center justify-between gap-2">
          {onBackToList ? (
            <button
              onClick={onBackToList}
              className="lg:hidden flex items-center gap-1.5 rounded-xl bg-[#1b1e2e] px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-[#25283c] transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Inbox</span>
            </button>
          ) : (
            <div />
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteMessage(message.id)}
            className="h-8 sm:h-9 gap-1.5 text-xs rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>

        {/* Subject & Sender */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-xl font-bold text-slate-100 tracking-tight leading-snug">
            {message.subject || "(No Subject)"}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400">
            <span className="font-semibold text-amber-300">
              {message.from.name || message.from.address}
            </span>
            <span className="font-mono text-slate-400 text-[10px] sm:text-xs truncate max-w-[200px] sm:max-w-none">
              &lt;{message.from.address}&gt;
            </span>
            <span>•</span>
            <span className="text-[10px] sm:text-xs">
              {formatFullDate(message.createdAt)}
            </span>
          </div>
        </div>

        {/* Smart OTP and Magic Link Extraction Banner */}
        {(extracted.otpCode || extracted.magicLinks.length > 0) && (
          <div className="flex flex-col gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 sm:p-4 shadow-inner border border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-amber-300">
                Smart Verification Extraction
              </span>
            </div>

            {extracted.otpCode && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#0b0c12]/90 p-2.5 sm:px-4 sm:py-2.5 shadow-inner border border-slate-800">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-slate-400">Detected OTP:</span>
                  <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-amber-400 select-all">
                    {extracted.otpCode}
                  </span>
                </div>

                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleCopyOtp}
                  className="h-8 gap-1 px-2.5 sm:px-3 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 shadow-md shadow-amber-500/20 shrink-0"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy OTP</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {extracted.magicLinks.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-400">
                  Action & Verification Links:
                </span>
                <div className="flex flex-col gap-1.5">
                  {extracted.magicLinks.map((url, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#0b0c12]/80 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono border border-slate-800"
                    >
                      <span className="truncate text-slate-300 max-w-[70%] sm:max-w-[80%] text-[11px]">
                        {url}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" /> Attachments:
            </span>
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={`https://api.mail.tm${att.downloadUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b1e2e] px-2.5 py-1 text-xs text-slate-200 hover:bg-[#25283c] transition-colors shadow-sm"
              >
                <Download className="h-3 w-3 text-amber-400" />
                <span className="truncate max-w-[120px]">{att.filename}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({Math.round(att.size / 1024)} KB)
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Tabs View: Rendered HTML / Plain Text / Raw Headers / JSON */}
      <Tabs
        defaultValue="html"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-800/60 px-3 sm:px-6 py-2 bg-[#0e101a]">
          <TabsList className="bg-[#171928] p-1 rounded-xl h-8 sm:h-9">
            <TabsTrigger
              value="html"
              className="gap-1 sm:gap-1.5 text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-lg px-2 sm:px-3 py-1"
            >
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>HTML</span>
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="gap-1 sm:gap-1.5 text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-lg px-2 sm:px-3 py-1"
            >
              <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="json"
              className="gap-1 sm:gap-1.5 text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-lg px-2 sm:px-3 py-1 font-mono"
            >
              <Code className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>JSON</span>
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="gap-1 sm:gap-1.5 text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-lg px-2 sm:px-3 py-1 font-mono"
            >
              <Terminal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>cURL</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Sanitized Rendered HTML */}
        <TabsContent
          value="html"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f111c]/60 m-0"
        >
          {sanitizedHtml ? (
            <div
              className="prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : message.text ? (
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
              {message.text}
            </pre>
          ) : (
            <div className="flex h-32 items-center justify-center text-xs text-slate-500">
              No HTML body in this email.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Plain Text */}
        <TabsContent
          value="text"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0b10] font-mono text-xs text-slate-300 m-0 leading-relaxed select-all"
        >
          {message.text || "No plain text content."}
        </TabsContent>

        {/* Tab 3: Message JSON */}
        <TabsContent
          value="json"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0b10] font-mono text-xs text-slate-300 m-0 relative"
        >
          <div className="absolute right-4 top-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="h-7 gap-1 px-2.5 text-[11px] rounded-lg bg-[#1a1d2e] text-slate-300"
            >
              {copiedJson ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedJson ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          <pre className="leading-relaxed select-all">
            {JSON.stringify(message, null, 2)}
          </pre>
        </TabsContent>

        {/* Tab 4: cURL replay command */}
        <TabsContent
          value="curl"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0b10] font-mono text-xs text-amber-300 m-0 relative"
        >
          <div className="absolute right-4 top-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCurl}
              className="h-7 gap-1 px-2.5 text-[11px] rounded-lg bg-[#1a1d2e] text-slate-300"
            >
              {copiedCurl ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
            </Button>
          </div>
          <pre className="leading-relaxed select-all">{curlSnippet}</pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
