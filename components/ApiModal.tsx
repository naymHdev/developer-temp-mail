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
import { Terminal, Copy, Check, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

interface ApiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiModal({ open, onOpenChange }: ApiModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Snippet copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const curlExample = `# 1. Create a mailbox in your script
curl -X POST "https://api.mail.tm/accounts" \\
  -H "Content-Type: application/json" \\
  -d '{"address": "user_qa@domain.com", "password": "secure_password"}'

# 2. Get JWT Token
curl -X POST "https://api.mail.tm/token" \\
  -H "Content-Type: application/json" \\
  -d '{"address": "user_qa@domain.com", "password": "secure_password"}'

# 3. Poll for messages (e.g. OTP verification)
curl -X GET "https://api.mail.tm/messages" \\
  -H "Authorization: Bearer <TOKEN>"`;

  const nodeExample = `// Playwright / Cypress / Node.js test script
async function waitForOtp(token) {
  for (let i = 0; i < 15; i++) {
    const res = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: \`Bearer \${token}\` },
    });
    const { "hydra:member": msgs } = await res.json();
    if (msgs.length > 0) {
      const msgRes = await fetch(\`https://api.mail.tm/messages/\${msgs[0].id}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await msgRes.json();
      // Extract OTP code regex
      const match = (data.text || "").match(/\\b([0-9]{6})\\b/);
      return match ? match[1] : null;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timeout waiting for OTP email");
}`;

  const pythonExample = `# Python / pytest integration
import requests
import time
import re

def wait_for_verification_code(token: str) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    for _ in range(15):
        r = requests.get("https://api.mail.tm/messages", headers=headers)
        messages = r.json().get("hydra:member", [])
        if messages:
            msg_id = messages[0]["id"]
            msg = requests.get(f"https://api.mail.tm/messages/{msg_id}", headers=headers).json()
            code_match = re.search(r'\\b([0-9]{6})\\b', msg.get("text", ""))
            if code_match:
                return code_match.group(1)
        time.sleep(2)
    raise TimeoutError("No verification email arrived")`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2.5 text-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Terminal className="h-4 w-4" />
            </div>
            <span>Developer Test Automation & API Docs</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            <span className="font-semibold text-amber-300">DTMail</span> is powered by Mail.tm&apos;s open, zero-cost API. Use these integration snippets to automate sign-up and OTP verification flows in your CI/CD pipelines.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2.5 rounded-2xl bg-[#0b0c12]/90 p-3.5 text-xs text-slate-300 shadow-inner">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Zero API keys needed. All authentication is scoped per disposable mailbox via JWT token.
          </span>
        </div>

        <Tabs defaultValue="node" className="w-full pt-1">
          <TabsList className="grid w-full grid-cols-3 bg-[#0b0c12]/90 rounded-2xl p-1">
            <TabsTrigger value="node" className="rounded-xl text-xs font-semibold">
              Node.js / E2E
            </TabsTrigger>
            <TabsTrigger value="curl" className="rounded-xl text-xs font-semibold">
              cURL
            </TabsTrigger>
            <TabsTrigger value="python" className="rounded-xl text-xs font-semibold">
              Python
            </TabsTrigger>
          </TabsList>

          <TabsContent value="node" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(nodeExample, "node")}
              className="absolute right-3 top-3 h-7 gap-1 text-xs text-slate-300 bg-[#1b1e2e]/90 hover:bg-[#25283c] rounded-lg shadow-md"
            >
              {copiedKey === "node" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-2xl bg-[#0b0c12]/95 p-4 font-mono text-xs text-amber-300 shadow-inner">
              {nodeExample}
            </pre>
          </TabsContent>

          <TabsContent value="curl" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(curlExample, "curl")}
              className="absolute right-3 top-3 h-7 gap-1 text-xs text-slate-300 bg-[#1b1e2e]/90 hover:bg-[#25283c] rounded-lg shadow-md"
            >
              {copiedKey === "curl" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-2xl bg-[#0b0c12]/95 p-4 font-mono text-xs text-amber-300 shadow-inner">
              {curlExample}
            </pre>
          </TabsContent>

          <TabsContent value="python" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(pythonExample, "python")}
              className="absolute right-3 top-3 h-7 gap-1 text-xs text-slate-300 bg-[#1b1e2e]/90 hover:bg-[#25283c] rounded-lg shadow-md"
            >
              {copiedKey === "python" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-2xl bg-[#0b0c12]/95 p-4 font-mono text-xs text-amber-300 shadow-inner">
              {pythonExample}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
