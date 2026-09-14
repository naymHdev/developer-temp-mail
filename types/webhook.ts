export interface WebhookConfig {
  enabled: boolean;
  targetUrl: string;
  customHeaderKey?: string;
  customHeaderValue?: string;
}

export interface WebhookPayload {
  event: "email.received" | "ping.test";
  mailbox: string;
  messageId: string;
  from: {
    address: string;
    name?: string;
  };
  subject: string;
  intro?: string;
  otpCode: string | null;
  magicLinks: string[];
  text: string;
  html?: string;
  timestamp: string;
}

export interface WebhookDeliveryLog {
  id: string;
  timestamp: string;
  targetUrl: string;
  event: string;
  status: number | "error";
  statusText: string;
  latencyMs: number;
  success: boolean;
  otpDetected?: string | null;
  error?: string;
}
