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
import { Terminal, Copy, Check, Code, ShieldCheck } from "lucide-react";
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-sky-400" />
            <span>Developer Test Automation & API Docs</span>
          </DialogTitle>
          <DialogDescription>
            DevTempMail is built on top of Mail.tm&apos;s open, zero-cost API. Use these snippets to automate sign-up flows in your testing pipelines.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Zero API keys required. All authentication is scoped per disposable account via JWT.
          </span>
        </div>

        <Tabs defaultValue="node" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="node">Node.js / E2E</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>

          <TabsContent value="node" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(nodeExample, "node")}
              className="absolute right-2 top-2 h-7 gap-1 text-xs text-slate-300 z-10"
            >
              {copiedKey === "node" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-sky-300">
              {nodeExample}
            </pre>
          </TabsContent>

          <TabsContent value="curl" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(curlExample, "curl")}
              className="absolute right-2 top-2 h-7 gap-1 text-xs text-slate-300 z-10"
            >
              {copiedKey === "curl" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-sky-300">
              {curlExample}
            </pre>
          </TabsContent>

          <TabsContent value="python" className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(pythonExample, "python")}
              className="absolute right-2 top-2 h-7 gap-1 text-xs text-slate-300 z-10"
            >
              {copiedKey === "python" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>Copy</span>
            </Button>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-sky-300">
              {pythonExample}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
