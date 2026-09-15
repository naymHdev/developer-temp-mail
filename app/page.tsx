"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Navbar } from "@/components/Navbar";
import { AddressBar } from "@/components/AddressBar";
import { MailboxSwitcher } from "@/components/MailboxSwitcher";
import { RateLimitBanner } from "@/components/RateLimitBanner";
import { InboxList } from "@/components/InboxList";
import { MessageViewer } from "@/components/MessageViewer";
import { FooterStats } from "@/components/FooterStats";
import { CustomMailboxModal } from "@/components/CustomMailboxModal";
import { ApiModal } from "@/components/ApiModal";
import { WebhookRelayModal } from "@/components/WebhookRelayModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import {
  MailTmMiniMessage,
  MailTmFullMessage,
  StoredMailbox,
} from "@/types/mailtm";
import {
  generateNewMailbox,
  getMessages,
  getMessage,
  deleteMessage,
  deleteAccount,
  MailTmError,
} from "@/lib/mailtm";
import {
  WebhookConfig,
  WebhookDeliveryLog,
  WebhookPayload,
} from "@/types/webhook";
import { extractOtpAndLinks } from "@/lib/extractor";
import { playNotificationSound } from "@/lib/audio";
import {
  requestNotificationPermission,
  sendDesktopNotification,
} from "@/lib/notifications";
import { trackAnonymousAction } from "@/components/TelemetryTracker";
import { toast } from "sonner";

const POLLING_INTERVAL_SECONDS = 5;
const STORAGE_KEY_MAILBOXES = "dtmail_stored_mailboxes";
const STORAGE_KEY_ACTIVE = "dtmail_active_address";
const STORAGE_KEY_WEBHOOK_CONFIG = "dtmail_webhook_config";
const STORAGE_KEY_WEBHOOK_LOGS = "dtmail_webhook_logs";
const STORAGE_KEY_DESKTOP_NOTIF = "dtmail_desktop_notifications";

/**
 * Intelligent mailbox provisioning:
 * 1. Executes directly in the user's browser (100% immune to Vercel/AWS datacenter IP blocks, zero latency).
 * 2. Background syncs session cookie with /api/mailbox/save.
 * 3. Falls back gracefully to /api/mailbox/create if needed.
 */
async function provisionMailbox(customPrefix?: string): Promise<StoredMailbox> {
  // 1. Direct browser-to-Mail.tm creation
  try {
    const data = await generateNewMailbox(customPrefix);
    const sessionId = `dtm_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const newMb: StoredMailbox = {
      sessionId,
      address: data.address,
      token: data.token,
      accountId: data.accountId,
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };

    // Track anonymous usage metric
    trackAnonymousAction("mailbox_created");

    // Sync session cookie in background (fire-and-forget)
    fetch("/api/mailbox/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMb),
    }).catch(() => {});

    return newMb;
  } catch (clientErr: unknown) {
    if (clientErr instanceof MailTmError && clientErr.status === 429) {
      throw clientErr;
    }

    // 2. Server route fallback
    try {
      const res = await fetch("/api/mailbox/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customPrefix ? { prefix: customPrefix } : {}),
      });
      const createData = await res.json();
      if (res.status === 429 || createData?.isRateLimited) {
        throw new MailTmError(
          "Rate limit reached",
          429,
          createData?.retryAfter || 30,
        );
      }
      if (createData?.mailbox?.address && createData?.mailbox?.token) {
        return {
          sessionId: createData.mailbox.sessionId,
          address: createData.mailbox.address,
          token: createData.mailbox.token,
          accountId: createData.mailbox.accountId,
          createdAt: createData.mailbox.createdAt,
          unreadCount: 0,
        };
      }
    } catch {
      // Fallback to rethrowing client error
    }

    throw clientErr instanceof Error
      ? clientErr
      : new Error("Failed to provision mailbox");
  }
}

export default function HomePage() {
  const [mailboxes, setMailboxes] = useState<StoredMailbox[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(POLLING_INTERVAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] =
    useState(false);

  // Rate Limit State
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(0);
  const [rateLimitTotal, setRateLimitTotal] = useState<number>(30);

  // Messages State
  const [messages, setMessages] = useState<MailTmMiniMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Message Viewer State
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [selectedMessage, setSelectedMessage] =
    useState<MailTmFullMessage | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  // Modals
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [isCreatingMailbox, setIsCreatingMailbox] = useState(false);

  // Webhook Relay State
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    enabled: false,
    targetUrl: "http://localhost:3000/api/mail-webhook",
  });
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>([]);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);

  const prevMessageCountRef = useRef<{ [address: string]: number }>({});
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  const activeMailbox = useMemo(() => {
    return mailboxes.find((m) => m.address === activeAddress) || null;
  }, [mailboxes, activeAddress]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY_WEBHOOK_CONFIG);
      if (savedConfig) {
        setWebhookConfig(JSON.parse(savedConfig));
      }
      const savedLogs = localStorage.getItem(STORAGE_KEY_WEBHOOK_LOGS);
      if (savedLogs) {
        setWebhookLogs(JSON.parse(savedLogs));
      }
      const savedNotif = localStorage.getItem(STORAGE_KEY_DESKTOP_NOTIF);
      if (
        savedNotif === "true" &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        if (Notification.permission === "granted") {
          setDesktopNotificationEnabled(true);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Toggle Desktop Notifications
  const handleToggleDesktopNotification = async () => {
    if (desktopNotificationEnabled) {
      setDesktopNotificationEnabled(false);
      localStorage.setItem(STORAGE_KEY_DESKTOP_NOTIF, "false");
      toast.info("Desktop notifications disabled.");
      return;
    }

    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      setDesktopNotificationEnabled(true);
      localStorage.setItem(STORAGE_KEY_DESKTOP_NOTIF, "true");
      toast.success("Desktop push notifications enabled!");
      sendDesktopNotification({
        title: "DTMail Notifications Active",
        body: "You will now receive desktop alerts for inbound verification codes.",
      });
    } else {
      setDesktopNotificationEnabled(false);
      localStorage.setItem(STORAGE_KEY_DESKTOP_NOTIF, "false");
      toast.error("Notification permission not granted in browser settings.");
    }
  };

  const handleSaveWebhookConfig = (newConfig: WebhookConfig) => {
    setWebhookConfig(newConfig);
    try {
      localStorage.setItem(
        STORAGE_KEY_WEBHOOK_CONFIG,
        JSON.stringify(newConfig),
      );
    } catch {
      // Fallback
    }
  };

  const handleClearWebhookLogs = () => {
    setWebhookLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY_WEBHOOK_LOGS);
    } catch {
      // Fallback
    }
    toast.success("Webhook delivery logs cleared.");
  };

  // Dispatch Webhook Relay
  const dispatchWebhookRelay = useCallback(
    async (payload: WebhookPayload) => {
      if (!webhookConfig.enabled || !webhookConfig.targetUrl.trim()) return;

      try {
        const res = await fetch("/api/webhook/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUrl: webhookConfig.targetUrl,
            customHeaderKey: webhookConfig.customHeaderKey,
            customHeaderValue: webhookConfig.customHeaderValue,
            payload,
          }),
        });

        const data = await res.json();
        const newLog: WebhookDeliveryLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          targetUrl: webhookConfig.targetUrl,
          event: payload.event,
          status: data.status,
          statusText: data.statusText || (data.success ? "OK" : "Error"),
          latencyMs: data.latencyMs || 0,
          success: Boolean(data.success),
          otpDetected: payload.otpCode,
          error: data.error,
        };

        setWebhookLogs((prev) => {
          const updated = [newLog, ...prev.slice(0, 49)];
          try {
            localStorage.setItem(
              STORAGE_KEY_WEBHOOK_LOGS,
              JSON.stringify(updated),
            );
          } catch {
            // Fallback
          }
          return updated;
        });

        if (data.success) {
          toast.success(`⚡ Webhook forwarded (${data.status} OK)`, {
            description: `Target: ${webhookConfig.targetUrl}`,
          });
        } else {
          toast.error(`Webhook delivery failed (${data.status})`, {
            description: data.error || data.statusText,
          });
        }
      } catch {
        toast.error("Failed to relay webhook to internal proxy");
      }
    },
    [webhookConfig],
  );

  // Send Test Webhook Ping
  const handleSendTestPing = async () => {
    if (!webhookConfig.targetUrl.trim()) {
      toast.error("Please enter a target URL first.");
      return;
    }

    setIsSendingTestWebhook(true);
    const testPayload: WebhookPayload = {
      event: "ping.test",
      mailbox: activeAddress || "test@uberip.com",
      messageId: `test_${Date.now()}`,
      from: {
        address: "ping@dtmail.dev",
        name: "DTMail Webhook Simulator",
      },
      subject: "Test Webhook Ping from DTMail",
      intro:
        "This is a simulated webhook ping to test your local server integration.",
      otpCode: "581902",
      magicLinks: ["http://localhost:3000/auth/verify?token=test1234"],
      text: "Verification code: 581902. This is a simulated payload dispatched from DTMail.",
      timestamp: new Date().toISOString(),
    };

    try {
      await dispatchWebhookRelay(testPayload);
    } finally {
      setIsSendingTestWebhook(false);
    }
  };

  // Rate limit countdown tick
  useEffect(() => {
    if (rateLimitRemaining <= 0) return;

    const timer = setInterval(() => {
      setRateLimitRemaining((prev) => {
        if (prev <= 1) {
          toast.success("Rate limit lifted. Service fully available.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitRemaining]);

  // Save mailboxes to localStorage
  const persistMailboxes = useCallback(
    (updatedList: StoredMailbox[], currentActive?: string) => {
      try {
        localStorage.setItem(
          STORAGE_KEY_MAILBOXES,
          JSON.stringify(updatedList),
        );
        if (currentActive) {
          localStorage.setItem(STORAGE_KEY_ACTIVE, currentActive);
        }
      } catch {
        // Fallback
      }
    },
    [],
  );

  // Initialize or restore mailboxes
  const initMailboxes = useCallback(async () => {
    setIsLoadingAddress(true);
    try {
      let savedMailboxes: StoredMailbox[] = [];
      let savedActive: string | null = null;

      try {
        const raw = localStorage.getItem(STORAGE_KEY_MAILBOXES);
        if (raw) {
          savedMailboxes = JSON.parse(raw);
        }
        savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      } catch {
        // Fallback
      }

      if (savedMailboxes.length > 0) {
        setMailboxes(savedMailboxes);
        const validActive =
          savedActive && savedMailboxes.some((m) => m.address === savedActive)
            ? savedActive
            : savedMailboxes[0].address;
        setActiveAddress(validActive);
        setIsLoadingAddress(false);
        return;
      }

      // No saved mailboxes -> Provision a new one
      try {
        const initialMb = await provisionMailbox();
        setMailboxes([initialMb]);
        setActiveAddress(initialMb.address);
        persistMailboxes([initialMb], initialMb.address);
      } catch (err) {
        if (err instanceof MailTmError && err.status === 429) {
          const waitTime = err.retryAfter || 30;
          setRateLimitTotal(waitTime);
          setRateLimitRemaining(waitTime);
          toast.error(`Rate limit reached. Please wait ${waitTime}s.`);
        } else {
          console.error("Mailbox provisioning error:", err);
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not initialize temporary mailbox.",
          );
        }
      }
    } catch (err) {
      console.error("initMailboxes caught:", err);
      toast.error("Failed to connect to mailbox service.");
    } finally {
      setIsLoadingAddress(false);
    }
  }, [persistMailboxes]);

  // Fetch messages for a specific mailbox
  const fetchMessagesForMailbox = useCallback(
    async (mailbox: StoredMailbox, isManual = false) => {
      if (!mailbox.token || rateLimitRemaining > 0) return;
      if (isManual && mailbox.address === activeAddress) setIsRefreshing(true);

      try {
        let newMessages: MailTmMiniMessage[] = [];

        try {
          const res = await getMessages(mailbox.token);
          newMessages = res.messages || [];
        } catch (clientErr: unknown) {
          if (clientErr instanceof MailTmError && clientErr.status === 429) {
            const waitTime = clientErr.retryAfter || 30;
            setRateLimitTotal(waitTime);
            setRateLimitRemaining(waitTime);
            return;
          }

          // Fallback to server route
          try {
            const res = await fetch("/api/mailbox/messages", {
              headers: {
                Authorization: `Bearer ${mailbox.token}`,
              },
            });

            const data = await res.json();

            if (res.status === 429 || data?.isRateLimited) {
              const waitTime = data?.retryAfter || 30;
              setRateLimitTotal(waitTime);
              setRateLimitRemaining(waitTime);
              return;
            }

            if (res.status === 401) {
              return;
            }

            if (Array.isArray(data?.messages)) {
              newMessages = data.messages;
            }
          } catch {
            return;
          }
        }
        const prevCount = prevMessageCountRef.current[mailbox.address] ?? 0;

        // Check if new messages arrived
        if (newMessages.length > prevCount) {
          const newlyArrived = newMessages.filter(
            (m) => !processedMessageIdsRef.current.has(m.id),
          );

          newlyArrived.forEach((msg) => {
            processedMessageIdsRef.current.add(msg.id);
            const extracted = extractOtpAndLinks(msg.subject, msg.intro || "");

            if (prevCount > 0) {
              if (soundEnabled) {
                playNotificationSound();
              }

              // Desktop Notification
              if (desktopNotificationEnabled) {
                const otpText = extracted.otpCode
                  ? `[OTP: ${extracted.otpCode}] `
                  : "";
                sendDesktopNotification({
                  title: `DTMail: New email for ${mailbox.address.split("@")[0]}`,
                  body: `${otpText}${msg.from.name || msg.from.address}: ${msg.subject}`,
                });
              }

              const [prefix] = mailbox.address.split("@");
              toast.success(`New email for [${prefix}]!`, {
                description: `${msg.from.name || msg.from.address}: ${msg.subject}`,
              });
            }

            // Webhook relay auto-dispatch
            if (webhookConfig.enabled && prevCount > 0) {
              const payload: WebhookPayload = {
                event: "email.received",
                mailbox: mailbox.address,
                messageId: msg.id,
                from: msg.from,
                subject: msg.subject,
                intro: msg.intro,
                otpCode: extracted.otpCode,
                magicLinks: extracted.magicLinks,
                text: msg.intro || "",
                timestamp: msg.createdAt,
              };
              dispatchWebhookRelay(payload);
            }
          });
        }

        prevMessageCountRef.current[mailbox.address] = newMessages.length;

        // Update active messages if this is the active mailbox
        if (mailbox.address === activeAddress) {
          setMessages(newMessages);
          if (newMessages.length > 0) {
            document.title = `(${newMessages.length}) DTMail — Disposable Inbox`;
          } else {
            document.title = "DTMail — Disposable Developer Email Inbox";
          }
        }

        // Update unread count for this mailbox in the switcher
        const unread = newMessages.filter((m) => !m.seen).length;
        setMailboxes((prev) =>
          prev.map((m) =>
            m.address === mailbox.address ? { ...m, unreadCount: unread } : m,
          ),
        );
      } catch {
        // Non-blocking
      } finally {
        if (isManual && mailbox.address === activeAddress)
          setIsRefreshing(false);
        if (mailbox.address === activeAddress)
          setCountdown(POLLING_INTERVAL_SECONDS);
      }
    },
    [
      activeAddress,
      soundEnabled,
      desktopNotificationEnabled,
      rateLimitRemaining,
      webhookConfig,
      dispatchWebhookRelay,
    ],
  );

  // Initial load
  useEffect(() => {
    initMailboxes();
  }, [initMailboxes]);

  // Load messages whenever active mailbox changes
  useEffect(() => {
    if (activeMailbox) {
      setSelectedMessageId(null);
      setSelectedMessage(null);
      setIsLoadingMessages(true);
      fetchMessagesForMailbox(activeMailbox).finally(() =>
        setIsLoadingMessages(false),
      );
    }
  }, [activeMailbox?.address, fetchMessagesForMailbox]);

  // Polling countdown interval for the active mailbox
  useEffect(() => {
    if (!activeMailbox || rateLimitRemaining > 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMessagesForMailbox(activeMailbox);
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMailbox, fetchMessagesForMailbox, rateLimitRemaining]);

  // Background polling for non-active mailboxes
  useEffect(() => {
    if (mailboxes.length <= 1 || rateLimitRemaining > 0) return;

    const bgInterval = setInterval(() => {
      mailboxes.forEach((mb) => {
        if (mb.address !== activeAddress) {
          fetchMessagesForMailbox(mb);
        }
      });
    }, 15000);

    return () => clearInterval(bgInterval);
  }, [mailboxes, activeAddress, fetchMessagesForMailbox, rateLimitRemaining]);

  // Switch active mailbox
  const handleSelectMailbox = (address: string) => {
    setActiveAddress(address);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, address);
    } catch {
      // Fallback
    }
  };

  // Add new random mailbox
  const handleAddRandomMailbox = async () => {
    if (rateLimitRemaining > 0) {
      toast.warning(
        `Rate limit cooldown active. Please wait ${rateLimitRemaining}s.`,
      );
      return;
    }

    setIsCreatingMailbox(true);
    try {
      const newMb = await provisionMailbox();
      const updated = [...mailboxes, newMb];
      setMailboxes(updated);
      setActiveAddress(newMb.address);
      persistMailboxes(updated, newMb.address);

      toast.success("New mailbox created & activated!", {
        description: newMb.address,
      });
    } catch (err) {
      if (err instanceof MailTmError && err.status === 429) {
        const waitTime = err.retryAfter || 30;
        setRateLimitTotal(waitTime);
        setRateLimitRemaining(waitTime);
        toast.error(
          `Rate limit reached. Please wait ${waitTime}s before creating.`,
        );
      } else {
        toast.error("Error creating mailbox.");
      }
    } finally {
      setIsCreatingMailbox(false);
    }
  };

  // Create custom prefix mailbox
  const handleCustomSubmit = async (prefix: string) => {
    if (rateLimitRemaining > 0) {
      toast.warning(
        `Rate limit cooldown active. Please wait ${rateLimitRemaining}s.`,
      );
      return;
    }

    setIsCreatingMailbox(true);
    try {
      const newMb = await provisionMailbox(prefix);
      const updated = [...mailboxes, newMb];
      setMailboxes(updated);
      setActiveAddress(newMb.address);
      persistMailboxes(updated, newMb.address);

      toast.success("Custom mailbox created & activated!", {
        description: newMb.address,
      });
    } catch (err) {
      if (err instanceof MailTmError && err.status === 429) {
        const waitTime = err.retryAfter || 30;
        setRateLimitTotal(waitTime);
        setRateLimitRemaining(waitTime);
        toast.error(
          `Rate limit reached. Please wait ${waitTime}s before creating.`,
        );
      } else {
        toast.error(
          err instanceof Error ? err.message : "Error creating custom mailbox.",
        );
      }
    } finally {
      setIsCreatingMailbox(false);
    }
  };

  // Remove a mailbox
  const handleRemoveMailbox = (
    addressToRemove: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (mailboxes.length <= 1) {
      toast.error("You must have at least one active mailbox.");
      return;
    }

    const updated = mailboxes.filter((m) => m.address !== addressToRemove);
    setMailboxes(updated);

    let nextActive = activeAddress;
    if (activeAddress === addressToRemove) {
      nextActive = updated[0].address;
      setActiveAddress(nextActive);
    }

    persistMailboxes(updated, nextActive || undefined);
    toast.success("Mailbox removed from workspace.");
  };

  // Delete current active mailbox
  const handleDeleteCurrentMailbox = async () => {
    if (!activeMailbox) return;

    if (mailboxes.length > 1) {
      handleRemoveMailbox(activeMailbox.address, {
        stopPropagation: () => {},
      } as unknown as React.MouseEvent);
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this temporary mailbox? A fresh one will be generated.",
      )
    ) {
      return;
    }

    setIsLoadingAddress(true);
    try {
      try {
        if (activeMailbox.accountId && activeMailbox.token) {
          await deleteAccount(activeMailbox.token, activeMailbox.accountId);
        }
      } catch {
        fetch("/api/mailbox/delete", { method: "POST" }).catch(() => {});
      }

      const newMb = await provisionMailbox();
      setMailboxes([newMb]);
      setActiveAddress(newMb.address);
      persistMailboxes([newMb], newMb.address);
      toast.success("Mailbox reset with fresh address.");
    } catch {
      toast.error("Error resetting mailbox.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Fetch single full message
  const handleSelectMessage = async (id: string) => {
    if (!activeMailbox?.token) return;
    setSelectedMessageId(id);
    setIsLoadingSelected(true);
    try {
      let fullMsg: MailTmFullMessage | null = null;
      try {
        fullMsg = await getMessage(activeMailbox.token, id);
      } catch {
        const res = await fetch(
          `/api/mailbox/messages/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${activeMailbox.token}`,
            },
          },
        );
        const data = await res.json();
        if (data?.message) fullMsg = data.message;
      }

      if (fullMsg) {
        setSelectedMessage(fullMsg);
      } else {
        toast.error("Failed to load email details.");
      }
    } catch {
      toast.error("Error loading email content.");
    } finally {
      setIsLoadingSelected(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeMailbox?.token) return;

    try {
      try {
        await deleteMessage(activeMailbox.token, id);
      } catch {
        await fetch(`/api/mailbox/messages/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${activeMailbox.token}`,
          },
        });
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessageId === id) {
        setSelectedMessageId(null);
        setSelectedMessage(null);
      }
      toast.success("Email deleted.");
    } catch {
      toast.error("Error deleting email.");
    }
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Do not trigger shortcuts with modifier keys (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      // ? => Open Keyboard Shortcuts cheatsheet
      if (e.key === "?") {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // C => Copy active email address
      if (key === "c" && activeAddress) {
        e.preventDefault();
        navigator.clipboard.writeText(activeAddress);
        toast.success("Email copied! (Shortcut: C)", {
          description: activeAddress,
        });
        return;
      }

      // O => Copy detected OTP code from selected message
      if (key === "o") {
        if (selectedMessage) {
          const htmlFirst = Array.isArray(selectedMessage.html)
            ? selectedMessage.html.join(" ")
            : "";
          const extracted = extractOtpAndLinks(
            selectedMessage.subject,
            selectedMessage.text,
            htmlFirst,
          );
          if (extracted.otpCode) {
            e.preventDefault();
            navigator.clipboard.writeText(extracted.otpCode);
            toast.success(
              `OTP Code copied: ${extracted.otpCode} (Shortcut: O)`,
            );
            return;
          }
        }
        toast.info("No OTP code found in currently opened email.");
        return;
      }

      // R => Manual Refresh
      if (key === "r" && activeMailbox) {
        e.preventDefault();
        fetchMessagesForMailbox(activeMailbox, true);
        toast.info("Inbox refreshed (Shortcut: R)");
        return;
      }

      // N => New random mailbox
      if (key === "n" && rateLimitRemaining === 0) {
        e.preventDefault();
        handleAddRandomMailbox();
        return;
      }

      // P => Open custom prefix modal
      if (key === "p" && rateLimitRemaining === 0) {
        e.preventDefault();
        setCustomModalOpen(true);
        return;
      }

      // W => Open Webhook Relay modal
      if (key === "w") {
        e.preventDefault();
        setWebhookModalOpen(true);
        return;
      }

      // J or ArrowDown => Next message
      if (key === "j" || e.key === "ArrowDown") {
        if (messages.length > 0) {
          e.preventDefault();
          const currentIndex = messages.findIndex(
            (m) => m.id === selectedMessageId,
          );
          const nextIndex =
            currentIndex === -1 || currentIndex === messages.length - 1
              ? 0
              : currentIndex + 1;
          handleSelectMessage(messages[nextIndex].id);
        }
        return;
      }

      // K or ArrowUp => Previous message
      if (key === "k" || e.key === "ArrowUp") {
        if (messages.length > 0) {
          e.preventDefault();
          const currentIndex = messages.findIndex(
            (m) => m.id === selectedMessageId,
          );
          const prevIndex =
            currentIndex <= 0 ? messages.length - 1 : currentIndex - 1;
          handleSelectMessage(messages[prevIndex].id);
        }
        return;
      }

      // D => Delete currently selected message
      if (key === "d" && selectedMessageId) {
        e.preventDefault();
        handleDeleteMessage(selectedMessageId);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeAddress,
    activeMailbox,
    selectedMessage,
    selectedMessageId,
    messages,
    rateLimitRemaining,
    fetchMessagesForMailbox,
  ]);

  const scrollToHealth = () => {
    const el = document.getElementById("platform-health");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0d0e14] text-slate-100 selection:bg-amber-500/25 selection:text-amber-200">
      {/* Warm Ambient Background Orbs */}
      <div className="bg-ambient-warm">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          onOpenApiModal={() => setApiModalOpen(true)}
          onOpenWebhookModal={() => setWebhookModalOpen(true)}
          onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
          isWebhookEnabled={webhookConfig.enabled}
          isNotificationEnabled={desktopNotificationEnabled}
          onToggleNotification={handleToggleDesktopNotification}
          onScrollToHealth={scrollToHealth}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3.5 sm:gap-5 p-3 sm:p-6 lg:p-8">
          {/* Rate Limit Visual Countdown Banner */}
          {rateLimitRemaining > 0 && (
            <RateLimitBanner
              remainingSeconds={rateLimitRemaining}
              totalSeconds={rateLimitTotal}
            />
          )}

          {/* Multi-Mailbox Switcher Pill Bar */}
          <MailboxSwitcher
            mailboxes={mailboxes}
            activeAddress={activeAddress}
            rateLimitRemaining={rateLimitRemaining}
            onSelectMailbox={handleSelectMailbox}
            onAddRandom={handleAddRandomMailbox}
            onOpenCustomModal={() => setCustomModalOpen(true)}
            onRemoveMailbox={handleRemoveMailbox}
            isCreating={isCreatingMailbox}
          />

          {/* Top Address & Action Bar */}
          <AddressBar
            address={activeAddress}
            isLoading={isLoadingAddress || isCreatingMailbox}
            isRefreshing={isRefreshing}
            countdown={countdown}
            soundEnabled={soundEnabled}
            rateLimitRemaining={rateLimitRemaining}
            onRefresh={() =>
              activeMailbox && fetchMessagesForMailbox(activeMailbox, true)
            }
            onGenerateNew={handleAddRandomMailbox}
            onOpenCustomModal={() => setCustomModalOpen(true)}
            onDeleteMailbox={handleDeleteCurrentMailbox}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
          />

          {/* Main Content: Split-Screen on Desktop, Smart Switcher on Mobile */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 min-h-[480px] lg:min-h-[580px]">
            {/* Left Column: Inbox List (hidden on mobile if an email is actively opened) */}
            <div
              className={`lg:col-span-5 xl:col-span-4 min-h-[480px] lg:min-h-0 lg:h-auto ${
                selectedMessageId ? "hidden lg:block" : "block"
              }`}
            >
              <InboxList
                messages={messages}
                selectedMessageId={selectedMessageId}
                isLoading={isLoadingMessages}
                onSelectMessage={handleSelectMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>

            {/* Right Column: Message Reader (hidden on mobile if no email is selected) */}
            <div
              className={`lg:col-span-7 xl:col-span-8 min-h-[480px] lg:min-h-0 lg:h-auto ${
                !selectedMessageId ? "hidden lg:block" : "block"
              }`}
            >
              <MessageViewer
                message={selectedMessage}
                isLoading={isLoadingSelected}
                onDeleteMessage={(id) => {
                  handleDeleteMessage(id);
                  setSelectedMessageId(null);
                  setSelectedMessage(null);
                }}
                onBackToList={() => {
                  setSelectedMessageId(null);
                  setSelectedMessage(null);
                }}
              />
            </div>
          </div>
        </main>

        {/* Footer with API Health & Global Active Timezone Chart */}
        <FooterStats />
      </div>

      {/* Modals */}
      <CustomMailboxModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        onSubmit={handleCustomSubmit}
      />

      <ApiModal open={apiModalOpen} onOpenChange={setApiModalOpen} />

      <WebhookRelayModal
        open={webhookModalOpen}
        onOpenChange={setWebhookModalOpen}
        config={webhookConfig}
        onSaveConfig={handleSaveWebhookConfig}
        logs={webhookLogs}
        onClearLogs={handleClearWebhookLogs}
        onSendTestPing={handleSendTestPing}
        isSendingTest={isSendingTestWebhook}
      />

      <ShortcutsModal
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
      />
    </div>
  );
}
