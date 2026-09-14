"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { AddressBar } from "@/components/AddressBar";
import { InboxList } from "@/components/InboxList";
import { MessageViewer } from "@/components/MessageViewer";
import { CustomMailboxModal } from "@/components/CustomMailboxModal";
import { ApiModal } from "@/components/ApiModal";
import { MailTmMiniMessage, MailTmFullMessage } from "@/types/mailtm";
import { playNotificationSound } from "@/lib/audio";
import { toast } from "sonner";

const POLLING_INTERVAL_SECONDS = 5;

export default function HomePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(POLLING_INTERVAL_SECONDS);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [messages, setMessages] = useState<MailTmMiniMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MailTmFullMessage | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const prevMessageCountRef = useRef(0);

  // Initialize or restore mailbox
  const initMailbox = useCallback(async () => {
    setIsLoadingAddress(true);
    try {
      const res = await fetch("/api/mailbox/current");
      const data = await res.json();

      if (data?.mailbox?.address) {
        setAddress(data.mailbox.address);
      } else {
        // Create new mailbox automatically
        const createRes = await fetch("/api/mailbox/create", { method: "POST" });
        const createData = await createRes.json();
        if (createData?.mailbox?.address) {
          setAddress(createData.mailbox.address);
        } else {
          toast.error("Could not initialize temporary mailbox.");
        }
      }
    } catch {
      toast.error("Failed to connect to mailbox service.");
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (isManual = false) => {
    if (!address) return;
    if (isManual) setIsRefreshing(true);

    try {
      const res = await fetch("/api/mailbox/messages");
      if (res.status === 401) {
        // Session invalid - reinitialize
        initMailbox();
        return;
      }
      const data = await res.json();

      if (Array.isArray(data?.messages)) {
        const newMessages: MailTmMiniMessage[] = data.messages;

        // Check if new messages arrived
        if (
          prevMessageCountRef.current > 0 &&
          newMessages.length > prevMessageCountRef.current
        ) {
          const latest = newMessages[0];
          if (soundEnabled) {
            playNotificationSound();
          }
          toast.success("New email received!", {
            description: `${latest.from.name || latest.from.address}: ${latest.subject}`,
          });
        }

        prevMessageCountRef.current = newMessages.length;
        setMessages(newMessages);

        // Update document title
        if (newMessages.length > 0) {
          document.title = `(${newMessages.length}) DevTempMail — Disposable Inbox`;
        } else {
          document.title = "DevTempMail — Disposable Developer Email Inbox";
        }
      }
    } catch {
      // Non-blocking poll failure
    } finally {
      if (isManual) setIsRefreshing(false);
      setCountdown(POLLING_INTERVAL_SECONDS);
    }
  }, [address, soundEnabled, initMailbox]);

  // Initial load
  useEffect(() => {
    initMailbox();
  }, [initMailbox]);

  // Load messages when address is set
  useEffect(() => {
    if (address) {
      setIsLoadingMessages(true);
      fetchMessages().finally(() => setIsLoadingMessages(false));
    }
  }, [address, fetchMessages]);

  // Countdown and periodic polling interval
  useEffect(() => {
    if (!address) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMessages();
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [address, fetchMessages]);

  // Fetch single full message
  const handleSelectMessage = async (id: string) => {
    setSelectedMessageId(id);
    setIsLoadingSelected(true);
    try {
      const res = await fetch(`/api/mailbox/messages/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data?.message) {
        setSelectedMessage(data.message);
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

    try {
      const res = await fetch(`/api/mailbox/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data?.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        prevMessageCountRef.current = Math.max(0, prevMessageCountRef.current - 1);
        if (selectedMessageId === id) {
          setSelectedMessageId(null);
          setSelectedMessage(null);
        }
        toast.success("Email deleted.");
      } else {
        toast.error("Failed to delete email.");
      }
    } catch {
      toast.error("Error deleting email.");
    }
  };

  // Generate new random mailbox
  const handleGenerateNew = async () => {
    setIsLoadingAddress(true);
    setSelectedMessageId(null);
    setSelectedMessage(null);
    setMessages([]);
    prevMessageCountRef.current = 0;

    try {
      const res = await fetch("/api/mailbox/create", { method: "POST" });
      const data = await res.json();
      if (data?.mailbox?.address) {
        setAddress(data.mailbox.address);
        toast.success("Generated new mailbox!", {
          description: data.mailbox.address,
        });
      } else {
        toast.error(data?.error || "Failed to create new mailbox.");
      }
    } catch {
      toast.error("Error generating new mailbox.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Create custom prefix mailbox
  const handleCustomSubmit = async (prefix: string) => {
    setIsLoadingAddress(true);
    setSelectedMessageId(null);
    setSelectedMessage(null);
    setMessages([]);
    prevMessageCountRef.current = 0;

    try {
      const res = await fetch("/api/mailbox/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix }),
      });
      const data = await res.json();
      if (data?.mailbox?.address) {
        setAddress(data.mailbox.address);
        toast.success("Custom mailbox created!", {
          description: data.mailbox.address,
        });
      } else {
        toast.error(data?.error || "Failed to create custom mailbox.");
      }
    } catch {
      toast.error("Error creating custom mailbox.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Delete current mailbox
  const handleDeleteMailbox = async () => {
    if (!confirm("Are you sure you want to delete this temporary mailbox? A new one will be generated.")) {
      return;
    }

    setIsLoadingAddress(true);
    try {
      await fetch("/api/mailbox/delete", { method: "POST" });
      await handleGenerateNew();
    } catch {
      toast.error("Error deleting mailbox.");
      setIsLoadingAddress(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-slate-100 selection:bg-sky-500/25">
      <Navbar onOpenApiModal={() => setApiModalOpen(true)} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
        {/* Top Address & Action Bar */}
        <AddressBar
          address={address}
          isLoading={isLoadingAddress}
          isRefreshing={isRefreshing}
          countdown={countdown}
          soundEnabled={soundEnabled}
          onRefresh={() => fetchMessages(true)}
          onGenerateNew={handleGenerateNew}
          onOpenCustomModal={() => setCustomModalOpen(true)}
          onDeleteMailbox={handleDeleteMailbox}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
        />

        {/* Main Content: Split-Screen Inbox & Viewer */}
        <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-12 min-h-[580px]">
          {/* Left Column: Inbox List */}
          <div className="lg:col-span-5 xl:col-span-4 h-[580px] lg:h-auto">
            <InboxList
              messages={messages}
              selectedMessageId={selectedMessageId}
              isLoading={isLoadingMessages}
              onSelectMessage={handleSelectMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>

          {/* Right Column: Message Reader */}
          <div className="lg:col-span-7 xl:col-span-8 min-h-[580px] lg:h-auto">
            <MessageViewer
              message={selectedMessage}
              isLoading={isLoadingSelected}
              onDeleteMessage={(id) => handleDeleteMessage(id)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CustomMailboxModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        onSubmit={handleCustomSubmit}
      />

      <ApiModal open={apiModalOpen} onOpenChange={setApiModalOpen} />
    </div>
  );
}
