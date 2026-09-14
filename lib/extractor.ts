export interface ExtractedEmailData {
  otpCode: string | null;
  magicLinks: string[];
  trackingUrls: string[];
}

export function extractOtpAndLinks(
  subject: string,
  text: string,
  htmlContent?: string
): ExtractedEmailData {
  const combinedContent = `${subject}\n${text || ""}\n${htmlContent || ""}`;

  // Common OTP code patterns (4-8 digits, or alphanumeric code with keywords)
  const otpPatterns = [
    /(?:verification|security|confirm(?:ation)?|otp|passcode|code|pin)(?:\s+is|\s*:\s*|\s+code\s+is\s+|\s+)?([0-9]{4,8})/i,
    /\b([0-9]{6})\b/,
    /\b([0-9]{4})\b/,
    /\b([0-9]{8})\b/,
    /(?:code|otp):\s*([a-zA-Z0-9]{5,8})\b/i,
  ];

  let otpCode: string | null = null;
  for (const pattern of otpPatterns) {
    const match = combinedContent.match(pattern);
    if (match && match[1]) {
      // Ignore common years or trivial numbers unless strongly matched
      const val = match[1];
      if (val !== "2024" && val !== "2025" && val !== "2026" && val !== "2027") {
        otpCode = val;
        break;
      }
    }
  }

  // Extract URLs
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const rawLinks = combinedContent.match(urlRegex) || [];

  // Filter & clean links
  const cleanedLinks = Array.from(
    new Set(
      rawLinks.map((url) => {
        // Strip trailing punctuation
        return url.replace(/[.,;:)\]}>]+$/, "");
      })
    )
  );

  const magicLinks: string[] = [];
  const trackingUrls: string[] = [];

  for (const url of cleanedLinks) {
    const lower = url.toLowerCase();
    if (
      lower.includes("verify") ||
      lower.includes("confirm") ||
      lower.includes("activate") ||
      lower.includes("auth") ||
      lower.includes("login") ||
      lower.includes("token=") ||
      lower.includes("magic") ||
      lower.includes("signup")
    ) {
      magicLinks.push(url);
    } else if (
      lower.includes("unsubscribe") ||
      lower.includes("track") ||
      lower.includes("click") ||
      lower.includes("open")
    ) {
      trackingUrls.push(url);
    } else {
      magicLinks.push(url);
    }
  }

  return {
    otpCode,
    magicLinks: magicLinks.slice(0, 5),
    trackingUrls: trackingUrls.slice(0, 5),
  };
}
