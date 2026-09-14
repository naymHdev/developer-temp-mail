import { NextResponse } from "next/server";
import { getSessionMailbox, clearSessionMailbox } from "@/lib/session";
import { deleteAccount } from "@/lib/mailtm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSessionMailbox();

    if (session?.token && session?.accountId) {
      try {
        await deleteAccount(session.token, session.accountId);
      } catch {
        // Mail.tm delete account failure shouldn't prevent clearing local session
      }
    }

    await clearSessionMailbox();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete mailbox",
      },
      { status: 500 }
    );
  }
}
