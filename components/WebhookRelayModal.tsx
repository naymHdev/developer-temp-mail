"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Webhook,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  ShieldCheck,
  Zap,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { WebhookConfig, WebhookDeliveryLog, WebhookPayload } from "@/types/webhook";
import { toast } from "sonner";

interface WebhookRelayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: WebhookConfig;
  onSaveConfig: (newConfig: WebhookConfig) => void;
  logs: WebhookDeliveryLog[];
  onClearLogs: () => void;
  onSendTestPing: () => Promise<void>;
  isSendingTest: boolean;
}

export function WebhookRelayModal({
  open,
  onOpenChange,
  config,
  onSaveConfig,
  logs,
  onClearLogs,
  onSendTestPing,
  isSendingTest,
}: WebhookRelayModalProps) {
  const [targetUrl, setTargetUrl] = useState(config.targetUrl);
  const [enabled, setEnabled] = useState(config.enabled);
  const [headerKey, setHeaderKey] = useState(config.customHeaderKey || "");
  const [headerValue, setHeaderValue] = useState(config.customHeaderValue || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      enabled,
      targetUrl: targetUrl.trim(),
      customHeaderKey: headerKey.trim() || undefined,
      customHeaderValue: headerValue.trim() || undefined,
    });
    toast.success("Webhook configuration saved!");
    onOpenChange(false);
  };

  const samplePayload: WebhookPayload = {
    event: "email.received",
    mailbox: "dev_test@uberip.com",
    messageId: "6aa891b2c",
    from: {
      address: "auth@github.com",
      name: "GitHub Security",
    },
    subject: "Your GitHub verification code is 849201",
    intro: "Use verification code 849201 to complete authentication.",
    otpCode: "849201",
    magicLinks: ["https://github.com/sessions/verified"],
    text: "Your one-time passcode is: 849201. It will expire in 10 minutes.",
    timestamp: new Date().toISOString(),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Webhook className="h-4 w-4" />
              </div>
              <span>Local Webhook Relay</span>
            </DialogTitle>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                enabled
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {enabled ? "RELAY ACTIVE" : "RELAY OFF"}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Automatically dispatch HTTP POST requests to your local backend server (`http://localhost:...`) or remote webhook URL whenever a disposable email arrives.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full pt-1">
          <TabsList className="grid w-full grid-cols-3 bg-[#0b0c12]/90 rounded-2xl p-1">
            <TabsTrigger value="settings" className="rounded-xl text-xs font-semibold">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl text-xs font-semibold">
              Delivery Logs ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="schema" className="rounded-xl text-xs font-semibold">
              JSON Payload
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="settings" className="space-y-4 pt-3">
            <form onSubmit={handleSave} className="space-y-4">
              {/* Enable / Disable Toggle Card */}
              <div className="flex items-center justify-between rounded-2xl bg-[#0b0c12]/90 p-4 shadow-inner">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">
                    Auto-Forward Inbound Emails
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Immediately send JSON payload with OTP code upon email arrival.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-amber-400"></div>
                </label>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Endpoint URL (HTTP / HTTPS)
                </label>
                <input
                  type="url"
                  placeholder="e.g. http://localhost:3000/api/mail-webhook or https://webhook.site/..."
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required={enabled}
                  className="h-11 w-full rounded-2xl bg-[#0b0c12]/90 px-4 font-mono text-xs text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                />
                <p className="text-[11px] text-slate-500">
                  CORS-free: Forwarded via DTMail serverless proxy directly to any port.
                </p>
              </div>

              {/* Optional Custom Auth / Secret Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Header Name (Optional)
                  </label>
                  <input
                    placeholder="e.g. X-Webhook-Secret or Authorization"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                    className="h-10 w-full rounded-2xl bg-[#0b0c12]/90 px-3.5 font-mono text-xs text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Header Value
                  </label>
                  <input
                    placeholder="e.g. Bearer my_secret_token"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    className="h-10 w-full rounded-2xl bg-[#0b0c12]/90 px-3.5 font-mono text-xs text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                  />
                </div>
              </div>

              {/* Action Buttons & Test Ping */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSendTestPing}
                  disabled={!targetUrl.trim() || isSendingTest}
                  className="h-9 gap-1.5 px-3.5 text-xs rounded-xl bg-[#1c1e2e] text-amber-300 hover:bg-[#25283c] shadow-sm font-semibold"
                >
                  {isSendingTest ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Send Test Ping</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-9 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 text-xs"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* Delivery Logs Tab */}
          <TabsContent value="logs" className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Recent Dispatches
              </span>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-2xl bg-[#0b0c12]/80 p-6 text-center shadow-inner">
                <Clock className="h-6 w-6 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">No webhooks dispatched yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click &quot;Send Test Ping&quot; in configuration to verify your endpoint.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1.5 rounded-2xl bg-[#0b0c12]/90 p-3.5 text-xs shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            {log.status} OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
                            <XCircle className="h-3 w-3" />
                            {log.status} {log.statusText}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-amber-300 font-semibold">
                          {log.event}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {log.latencyMs}ms • {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono truncate max-w-[320px]">
                        {log.targetUrl}
                      </span>
                      {log.otpDetected && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 font-bold">
                          OTP: {log.otpDetected}
                        </span>
                      )}
                    </div>
                    {log.error && (
                      <p className="text-[11px] text-red-400 font-mono">
                        Error: {log.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* JSON Payload Schema Tab */}
          <TabsContent value="schema" className="pt-3">
            <div className="rounded-2xl bg-[#0b0c12]/95 p-4 shadow-inner space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Sample Webhook POST Body
              </span>
              <pre className="max-h-[300px] overflow-y-auto font-mono text-xs text-amber-200">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
