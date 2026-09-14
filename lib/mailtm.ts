import {
  MailTmAccount,
  MailTmDomain,
  MailTmFullMessage,
  MailTmMiniMessage,
  MailTmTokenResponse,
} from "@/types/mailtm";

const API_BASE =
  process.env.NEXT_PUBLIC_MAILTM_API_URL || "https://api.mail.tm";

export class MailTmError extends Error {
  status: number;
  retryAfter: number;

  constructor(message: string, status: number = 500, retryAfter: number = 30) {
    super(message);
    this.name = "MailTmError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorMessage = `Mail.tm API error: ${response.status} ${response.statusText}`;
      let retryAfter = 30;

      const retryHeader = response.headers.get("Retry-After");
      if (retryHeader) {
        const parsed = parseInt(retryHeader, 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfter = parsed;
        }
      }

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData["hydra:description"]) {
          errorMessage = errorData["hydra:description"];
        }
      } catch {
        // use default message
      }

      if (response.status === 429) {
        errorMessage = "Mail.tm rate limit reached. Please wait a moment.";
      } else if (response.status === 401) {
        errorMessage = "Mailbox session token expired or invalid.";
      }

      throw new MailTmError(errorMessage, response.status, retryAfter);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof MailTmError) {
      throw error;
    }
    if ((error as { name?: string })?.name === "AbortError") {
      throw new MailTmError("Mail.tm request timed out. Please try again.", 504);
    }
    throw new MailTmError(
      error instanceof Error ? error.message : "Failed to connect to Mail.tm service",
      500
    );
  }
}

export async function getAvailableDomains(): Promise<MailTmDomain[]> {
  const data = await request<MailTmDomain[] | { "hydra:member": MailTmDomain[] }>("/domains");
  let domains: MailTmDomain[] = [];
  if (Array.isArray(data)) {
    domains = data;
  } else if (data && Array.isArray(data["hydra:member"])) {
    domains = data["hydra:member"];
  }

  const activeDomains = domains.filter((d) => d.isActive !== false);
  if (activeDomains.length === 0 && domains.length > 0) {
    return domains;
  }
  return activeDomains;
}

export async function createAccount(
  address: string,
  password: string
): Promise<MailTmAccount> {
  return await request<MailTmAccount>("/accounts", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
}

export async function getToken(
  address: string,
  password: string
): Promise<MailTmTokenResponse> {
  return await request<MailTmTokenResponse>("/token", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
}

export async function getAccountMe(token: string): Promise<MailTmAccount> {
  return await request<MailTmAccount>("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMessages(
  token: string,
  page: number = 1
): Promise<{ messages: MailTmMiniMessage[]; total: number }> {
  const data = await request<
    | MailTmMiniMessage[]
    | {
        "hydra:member": MailTmMiniMessage[];
        "hydra:totalItems": number;
      }
  >(`/messages?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (Array.isArray(data)) {
    return {
      messages: data,
      total: data.length,
    };
  }

  return {
    messages: data?.["hydra:member"] || [],
    total: data?.["hydra:totalItems"] || 0,
  };
}

export async function getMessage(
  token: string,
  messageId: string
): Promise<MailTmFullMessage> {
  return await request<MailTmFullMessage>(`/messages/${encodeURIComponent(messageId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteMessage(
  token: string,
  messageId: string
): Promise<void> {
  await request<void>(`/messages/${encodeURIComponent(messageId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteAccount(
  token: string,
  accountId: string
): Promise<void> {
  await request<void>(`/accounts/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function generateRandomPassword(): string {
  return `DTM_${Math.random().toString(36).slice(-8)}_${Date.now().toString(36)}`;
}

export async function generateNewMailbox(customPrefix?: string): Promise<{
  address: string;
  password: string;
  token: string;
  accountId: string;
}> {
  const domains = await getAvailableDomains();
  if (!domains || domains.length === 0) {
    throw new MailTmError("No active domains available from Mail.tm", 503);
  }

  // Pick the first active domain
  const chosenDomain = domains[0].domain;

  const prefix = (customPrefix || "dev")
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "")
    .slice(0, 15);

  const username = `${prefix || "dev"}_${generateRandomSuffix()}`;
  const address = `${username}@${chosenDomain}`;
  const password = generateRandomPassword();

  const account = await createAccount(address, password);
  const tokenData = await getToken(address, password);

  return {
    address: account.address,
    password,
    token: tokenData.token,
    accountId: account.id,
  };
}
