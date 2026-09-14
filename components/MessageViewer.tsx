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
}

export function MessageViewer({
  message,
  isLoading,
  onDeleteMessage,
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
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-3xl bg-[#141622]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono">Fetching full email content...</span>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-3xl bg-[#141622]/90 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1b1e2e] text-amber-400/80 shadow-inner mb-3">
          <Mail className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-slate-100">No message selected</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
          Select an email from the inbox on the left to read its contents, extract OTP codes, and inspect developer headers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#141622]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
      {/* Email Header */}
      <div className="flex flex-col gap-3.5 p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              {message.subject || "(No Subject)"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-300">
                {message.from.name || message.from.address}
              </span>
              <span className="font-mono text-slate-400">
                &lt;{message.from.address}&gt;
              </span>
              <span>•</span>
              <span>{formatFullDate(message.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteMessage(message.id)}
              className="h-9 gap-1.5 text-xs rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-md shadow-black/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Smart OTP and Magic Link Extraction Banner */}
        {(extracted.otpCode || extracted.magicLinks.length > 0) && (
          <div className="flex flex-col gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-amber-300">
                Smart Verification Extraction
              </span>
            </div>

            {extracted.otpCode && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#0b0c12]/90 px-4 py-2.5 shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Detected OTP:</span>
                  <span className="font-mono text-xl font-black tracking-widest text-amber-400">
                    {extracted.otpCode}
                  </span>
                </div>

                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleCopyOtp}
                  className="h-8 gap-1 px-3 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20"
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
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#0b0c12]/80 px-3 py-2 text-xs font-mono"
                    >
                      <span className="truncate text-slate-300 max-w-[80%]">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b1e2e] px-3 py-1.5 text-xs text-slate-200 hover:bg-[#25283c] transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>{att.filename}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({Math.round(att.size / 1024)} KB)
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="rendered" className="flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <TabsList className="bg-[#0b0c12]/90 rounded-2xl p-1">
            <TabsTrigger value="rendered" className="gap-1.5 rounded-xl">
              <Eye className="h-3.5 w-3.5" />
              <span>Rendered View</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5 rounded-xl">
              <FileText className="h-3.5 w-3.5" />
              <span>Plain Text</span>
            </TabsTrigger>
            <TabsTrigger value="inspector" className="gap-1.5 rounded-xl">
              <Code className="h-3.5 w-3.5" />
              <span>Dev Inspector</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Rendered HTML Tab */}
        <TabsContent value="rendered" className="flex-1 overflow-y-auto mt-3">
          {sanitizedHtml ? (
            <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-xl overflow-x-auto min-h-[300px]">
              <div
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                className="prose max-w-none prose-p:my-2 prose-headings:my-3"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0b0c12]/80 p-6 text-slate-300 font-sans text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
              {message.text || "(No HTML or text body found)"}
            </div>
          )}
        </TabsContent>

        {/* Plain Text Tab */}
        <TabsContent value="text" className="flex-1 overflow-y-auto mt-3">
          <div className="rounded-2xl bg-[#0b0c12]/90 p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text shadow-inner">
            {message.text || "(No plain text content)"}
          </div>
        </TabsContent>

        {/* Dev Inspector Tab */}
        <TabsContent value="inspector" className="flex-1 overflow-y-auto mt-3 space-y-4">
          {/* cURL automation snippet */}
          <div className="flex flex-col gap-2 rounded-2xl bg-[#0b0c12]/90 p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Automate in Tests (cURL / Script)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCurl}
                className="h-7 gap-1 text-xs text-slate-300 rounded-lg hover:bg-[#1b1e2e]"
              >
                {copiedCurl ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy Command</span>
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-[#141622] p-3.5 font-mono text-[11px] text-amber-300">
              {curlSnippet}
            </pre>
          </div>

          {/* Raw JSON Payload */}
          <div className="flex flex-col gap-2 rounded-2xl bg-[#0b0c12]/90 p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">
                  Raw Message JSON
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="h-7 gap-1 text-xs text-slate-300 rounded-lg hover:bg-[#1b1e2e]"
              >
                {copiedJson ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy JSON</span>
              </Button>
            </div>
            <pre className="max-h-[300px] overflow-y-auto rounded-xl bg-[#141622] p-3.5 font-mono text-[11px] text-slate-300 select-all">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
