export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

export function sendDesktopNotification({
  title,
  body,
  tag,
  onClick,
}: {
  title: string;
  body: string;
  tag?: string;
  onClick?: () => void;
}) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      tag: tag || "dtmail-notification",
      icon: "/favicon.ico",
    });

    notification.onclick = () => {
      window.focus();
      if (onClick) onClick();
      notification.close();
    };
  } catch {
    // Graceful fallback
  }
}
