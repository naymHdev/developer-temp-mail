import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { MailboxSession } from "@/types/mailtm";

const SESSION_COOKIE_NAME = "dtm_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Only attempt PostgreSQL connection if a valid remote pooled URL is configured (not dummy localhost on serverless)
const isDatabaseAvailable = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("localhost") &&
  !process.env.DATABASE_URL.includes("127.0.0.1")
);

export async function getSessionMailbox(): Promise<MailboxSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const rawData = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const sessionData: MailboxSession = JSON.parse(rawData);

    if (!sessionData.address || !sessionData.token) {
      return null;
    }

    if (isDatabaseAvailable) {
      try {
        await prisma.mailboxAccount.updateMany({
          where: { sessionId: sessionData.sessionId },
          data: { lastActiveAt: new Date() },
        });
      } catch {
        // Non-blocking database sync
      }
    }

    return sessionData;
  } catch {
    return null;
  }
}

export async function saveSessionMailbox(session: MailboxSession): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  if (isDatabaseAvailable) {
    try {
      await prisma.mailboxAccount.upsert({
        where: { sessionId: session.sessionId },
        update: {
          address: session.address,
          mailTmAccountId: session.accountId,
          mailTmToken: session.token,
          lastActiveAt: new Date(),
        },
        create: {
          sessionId: session.sessionId,
          address: session.address,
          password: `pass_${session.sessionId.slice(0, 8)}`,
          mailTmAccountId: session.accountId,
          mailTmToken: session.token,
        },
      });
    } catch {
      // Non-blocking database persistence fallback
    }
  }
}

export async function clearSessionMailbox(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      const rawData = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
      const sessionData: MailboxSession = JSON.parse(rawData);

      if (sessionData.sessionId && isDatabaseAvailable) {
        await prisma.mailboxAccount.deleteMany({
          where: { sessionId: sessionData.sessionId },
        });
      }
    } catch {
      // Non-blocking
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
