import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { targetUrl, customHeaderKey, customHeaderValue, payload } = body;

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid targetUrl" },
        { status: 400 }
      );
    }

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "DTMail-Webhook-Relay/1.0",
      "X-DTMail-Event": payload?.event || "email.received",
      "X-DTMail-Delivery": `dlv_${Date.now().toString(36)}`,
    };

    if (
      customHeaderKey &&
      customHeaderValue &&
      typeof customHeaderKey === "string" &&
      typeof customHeaderValue === "string"
    ) {
      headers[customHeaderKey.trim()] = customHeaderValue.trim();
    }

    // Timeout controller (8 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload || {}),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      let responseSnippet = "";
      try {
        const text = await response.text();
        responseSnippet = text.slice(0, 300);
      } catch {
        // Fallback
      }

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        responseSnippet,
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isAbort = (fetchError as { name?: string })?.name === "AbortError";

      return NextResponse.json({
        success: false,
        status: isAbort ? 504 : 502,
        statusText: isAbort ? "Connection Timeout" : "Connection Refused / Network Error",
        latencyMs,
        error:
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to connect to webhook target",
      });
    }
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        status: 500,
        statusText: "Internal Relay Error",
        latencyMs,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
