"use client";

import { useEffect, useRef } from "react";

const VISITOR_ID_KEY = "dtm_anonymous_visitor_id";
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

/**
 * Global helper to track anonymous actions (e.g. mailbox_created)
 */
export function trackAnonymousAction(actionName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dtm_track_action", { detail: { action: actionName } })
    );
  }
}

export function TelemetryTracker() {
  const visitorIdRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Get or create persistent anonymous UUID
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = `v_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    visitorIdRef.current = visitorId;

    // 2. Collect client-side metadata
    const getClientSpecs = () => {
      return {
        screenResolution:
          typeof window !== "undefined"
            ? `${window.screen.width}x${window.screen.height}`
            : undefined,
        language: typeof navigator !== "undefined" ? navigator.language : undefined,
        timezone:
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : undefined,
      };
    };

    // 3. Heartbeat sender
    const sendHeartbeat = async (action?: string) => {
      try {
        const specs = getClientSpecs();
        const res = await fetch("/api/telemetry/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: visitorIdRef.current,
            ...specs,
            action,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.activeUsersCount) {
            // Broadcast live active count to Navbar & UI components
            window.dispatchEvent(
              new CustomEvent("dtm_active_users_update", {
                detail: { count: data.activeUsersCount, geo: data.geo },
              })
            );
          }
        }
      } catch {
        // Silently fail network hiccups
      }
    };

    // Initial heartbeat on site entry
    sendHeartbeat("init");

    // Periodic heartbeat every 30s
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    // Heartbeat on tab focus / visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat("visibility_return");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Custom action event listener
    const handleCustomAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      if (customEvent.detail?.action) {
        sendHeartbeat(customEvent.detail.action);
      }
    };
    window.addEventListener("dtm_track_action", handleCustomAction);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("dtm_track_action", handleCustomAction);
    };
  }, []);

  return null;
}
